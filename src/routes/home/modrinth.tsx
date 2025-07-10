import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { downloadFile } from "@/tauri/commands";
import { useOptions } from "@/store/options";
import { useRemote } from "@/store/remote";
import { exists } from "@tauri-apps/plugin-fs";
import Alert from "@/kit/alert";

export const Route = createFileRoute("/home/modrinth")({
  component: RouteComponent,
});

interface ModPack {
  slug: string;
  title: string;
  description: string;
  icon_url?: string;
  downloads: number;
  project_id: string;
  versions?: string[];
  categories?: string[];
}

function RouteComponent() {
  const [modpacks, setModpacks] = useState<ModPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [downloading, setDownloading] = useState<string[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modInstallStatus, setModInstallStatus] = useState<{
    [modId: string]: boolean;
  }>({});
  const [checkingInstallStatus, setCheckingInstallStatus] = useState(false);
  const [modVersionCache, setModVersionCache] = useState<{
    [modId: string]: any[];
  }>({});
  const [lastCheckedGame, setLastCheckedGame] = useState<string>("");
  const localOptions = useOptions();
  const remote = useRemote();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const fetchModpacks = async () => {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      try {
        const searchParam = debouncedSearchQuery
          ? `&query=${encodeURIComponent(debouncedSearchQuery)}`
          : "";
        const response = await fetch(
          `https://api.modrinth.com/v2/search?facets=[["project_type:mod"]]&limit=9&offset=${(currentPage - 1) * 25}${searchParam}`
        );
        const data = await response.json();
        console.log(data);
        setModpacks(data.hits);
        setTotalPages(Math.ceil(data.total_hits / 25));

        // Preload version data for faster installation checks
        if (data.hits && data.hits.length > 0) {
          const versionPromises = data.hits.map(async (mod: ModPack) => {
            const modId = mod.project_id || mod.slug;
            try {
              const versionsResponse = await fetch(
                `https://api.modrinth.com/v2/project/${modId}/version`
              );
              const versions = await versionsResponse.json();
              return { modId, versions };
            } catch (error) {
              console.error(
                `Failed to fetch versions for ${mod.title}:`,
                error
              );
              return { modId, versions: [] };
            }
          });

          // Load versions in the background
          Promise.all(versionPromises).then((versionData) => {
            const versionCache: { [modId: string]: any[] } = {};
            versionData.forEach(({ modId, versions }) => {
              versionCache[modId] = versions;
            });
            setModVersionCache((prev) => ({ ...prev, ...versionCache }));

            // After loading versions, check installation status only if we have a selected game
            // and we haven't checked this game yet
            if (selectedGameId && selectedGameId !== lastCheckedGame) {
              checkModsInstallationStatus(data.hits, selectedGameId);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch modpacks:", error);
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };

    fetchModpacks();
  }, [currentPage, debouncedSearchQuery]);

  // Set default game selection
  useEffect(() => {
    if (remote.games && remote.games.length > 0 && !selectedGameId) {
      setSelectedGameId(remote.games[0].id);
    }
  }, [remote.games, selectedGameId]);

  // Check installation status when game selection changes
  useEffect(() => {
    if (selectedGameId && selectedGameId !== lastCheckedGame) {
      // Clear previous status when switching games
      setModInstallStatus({});

      if (
        modpacks.length > 0 &&
        Object.keys(modVersionCache).length > 0 &&
        !checkingInstallStatus
      ) {
        setLastCheckedGame(selectedGameId);
        checkModsInstallationStatus(modpacks, selectedGameId);
      }
    }
  }, [
    selectedGameId,
    modpacks,
    modVersionCache,
    lastCheckedGame,
    checkingInstallStatus,
  ]);

  // Debug effect to log status changes
  useEffect(() => {
    console.log("Mod install status updated:", modInstallStatus);
  }, [modInstallStatus]);

  const checkSingleModInstallation = async (modId: string, gameId: string) => {
    try {
      // Use cached version data if available
      let versions = modVersionCache[modId];
      if (!versions) {
        const versionsResponse = await fetch(
          `https://api.modrinth.com/v2/project/${modId}/version`
        );
        versions = await versionsResponse.json();

        // Cache the versions for future use
        setModVersionCache((prev) => ({
          ...prev,
          [modId]: versions,
        }));
      }

      if (versions && versions.length > 0) {
        // Check only the first few versions to be faster
        for (const version of versions.slice(0, 3)) {
          for (const file of version.files) {
            const modPath = `${localOptions.appDir}/games/${gameId}/mods/${file.filename}`;
            const fileExists = await exists(modPath);
            if (fileExists) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error(
        `Failed to check installation status for mod ${modId}:`,
        error
      );
      return false;
    }
  };

  const checkModsInstallationStatus = async (
    mods: ModPack[],
    gameId: string
  ) => {
    if (checkingInstallStatus) return; // Prevent multiple simultaneous checks

    setCheckingInstallStatus(true);
    const statusUpdates: { [modId: string]: boolean } = {};

    try {
      // Process all mods in parallel with a reasonable concurrency limit
      const checkPromises = mods.map(async (mod) => {
        const modId = mod.project_id || mod.slug;
        const isInstalled = await checkSingleModInstallation(modId, gameId);
        return { modId, isInstalled };
      });

      const results = await Promise.all(checkPromises);

      // Update all statuses at once to prevent flickering
      results.forEach(({ modId, isInstalled }) => {
        statusUpdates[modId] = isInstalled;
      });

      setModInstallStatus(statusUpdates);
    } catch (error) {
      console.error("Error checking installation status:", error);
    } finally {
      console.log("Installation status updates completed");
      setCheckingInstallStatus(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debouncedSearchQuery !== query) {
      setCurrentPage(1); // Reset to first page when searching
    }
  };

  const handleDownload = async (
    modpack: ModPack,
    gameId: string,
    options?: {
      version?: string;
      minecraftVersion?: string;
      modLoader?: string;
    }
  ) => {
    const modId = modpack.project_id || modpack.slug;

    try {
      setDownloading((prev) => [...prev, modId]);

      // Get available versions for the mod
      const versionsResponse = await fetch(
        `https://api.modrinth.com/v2/project/${modId}/version`
      );
      const versions = await versionsResponse.json();

      if (!versions || versions.length === 0) {
        throw new Error("No versions available for this mod");
      }

      // Filter versions based on parameters
      let filteredVersions = versions;

      if (options?.minecraftVersion) {
        filteredVersions = filteredVersions.filter((version: any) =>
          version.game_versions.includes(options.minecraftVersion)
        );
      }

      if (options?.modLoader) {
        filteredVersions = filteredVersions.filter((version: any) =>
          version.loaders.includes(options.modLoader!.toLowerCase())
        );
      }

      // Get the latest compatible version or specified version
      const targetVersion = options?.version
        ? filteredVersions.find(
            (v: any) => v.version_number === options.version
          )
        : filteredVersions[0]; // Latest version

      if (!targetVersion) {
        throw new Error("No compatible version found");
      }

      // Get the primary file from the version
      const primaryFile =
        targetVersion.files.find((file: any) => file.primary) ||
        targetVersion.files[0];

      if (!primaryFile) {
        throw new Error("No download file found");
      }

      // Get the selected game info
      const selectedGame = remote.games?.find((game) => game.id === gameId);
      if (!selectedGame) {
        throw new Error("Selected game not found");
      }

      // Create download path for the specific game
      const downloadPath = `${localOptions.appDir}/games/${gameId}/mods/${primaryFile.filename}`;

      // Check if file already exists before downloading
      const fileExists = await exists(downloadPath);
      if (fileExists) {
        alert(`${modpack.title} is already installed for this game.`);
        return;
      }

      console.log(
        `Downloading ${modpack.title} to game: ${selectedGame.title || selectedGame.id}`
      );
      console.log(`Download path: ${downloadPath}`);

      // Download the file using Tauri command
      await downloadFile(primaryFile.url, downloadPath);

      // Refresh installation status for this specific mod
      const isNowInstalled = await checkSingleModInstallation(modId, gameId);
      setModInstallStatus((prev) => ({
        ...prev,
        [modId]: isNowInstalled,
      }));

      console.log(
        `Successfully downloaded ${modpack.title} for ${selectedGame.title || selectedGame.id}`
      );
    } catch (error) {
      console.error(`Failed to download ${modpack.title}:`, error);
      alert(
        `Failed to download ${modpack.title}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setDownloading((prev) => prev.filter((id) => id !== modId));
    }
  };

  const isModInstalled = (modId: string): boolean => {
    return modInstallStatus[modId] || false;
  };

  const handleInstallClick = (modpack: ModPack) => {
    if (!selectedGameId) {
      Alert({ message: "Please select a game first.", title: "warning" });
      return;
    }

    const modId = modpack.project_id || modpack.slug;
    if (isModInstalled(modId)) {
      alert(`${modpack.title} is already installed for the selected game.`);
      return;
    }

    const selectedGame = remote.games?.find(
      (game) => game.id === selectedGameId
    );
    if (!selectedGame) {
      throw new Error("Selected game not found");
    }
    handleDownload(modpack, selectedGameId, {
      minecraftVersion: selectedGame.minecraft?.version,
      modLoader: selectedGame.minecraft?.loader.type,
    });

    // Download directly to the selected game
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center bg-darker">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70 text-sm">Loading modpacks...</p>
        </div>
      </div>
    );

  return (
    <motion.div className="min-h-0 bg-darker relative size-full flex flex-col">
      <div
        className="absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-l-8 border-r-8 border-black/40 pointer-events-none"
        style={{
          backgroundSize: "auto 192px",
          backgroundPosition: "center center",
        }}
      />

      <div className="p-8 pb-4">
        <div className="relative z-10">
          <span className="text-4xl flex font-bold">Browse</span>
          {/* Search Bar and Game Selector */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="relative max-w-md mt-2 flex-1">
              <input
                type="text"
                placeholder="Search mods..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Game Selector */}
            <div className="min-w-[220px] relative" data-dropdown>
              <label className="block text-white/70 text-xs mb-1">
                Install to Game:
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition-all duration-200 flex items-center justify-between group hover:bg-white/15"
                >
                  <span className="text-sm">
                    {selectedGameId 
                      ? remote.games?.find(game => game.id === selectedGameId)?.title || selectedGameId
                      : "Select a game..."
                    }
                  </span>
                  <svg 
                    className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
                    {!selectedGameId && (
                      <div className="px-4 py-3 text-white/50 text-xs border-b border-white/10">
                        Choose a game to install mods to
                      </div>
                    )}
                    <div className="max-h-48 overflow-y-auto">
                      {remote.games?.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => {
                            setSelectedGameId(game.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 flex items-center gap-3 hover:bg-white/10 ${
                            selectedGameId === game.id ? 'bg-primary/20 text-primary' : 'text-white'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            selectedGameId === game.id ? 'bg-primary' : 'bg-white/20'
                          }`} />
                          <span className="truncate">{game.title || game.id}</span>
                          {selectedGameId === game.id && (
                            <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pageLoading && (
            <div className="absolute inset-0 bg-darker/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-white/70 text-xs">Loading...</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {modpacks.map((modpack) => (
              <div
                key={modpack.slug}
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur rounded-lg border border-primary/20 hover:border-primary transition-colors duration-200 cursor-pointer p-3"
              >
                <div className="flex items-start gap-3">
                  {modpack.icon_url && (
                    <img
                      src={modpack.icon_url}
                      alt={modpack.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                      {modpack.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                      {modpack.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {modpack.downloads.toLocaleString()} downloads
                      </span>
                      <button
                        onClick={() => handleInstallClick(modpack)}
                        disabled={
                          downloading.includes(
                            modpack.project_id || modpack.slug
                          ) ||
                          isModInstalled(modpack.project_id || modpack.slug) ||
                          !selectedGameId
                        }
                        className="px-2 py-1 bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white text-xs font-medium rounded transition-colors disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {downloading.includes(
                          modpack.project_id || modpack.slug
                        ) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            <span>Downloading...</span>
                          </>
                        ) : isModInstalled(
                            modpack.project_id || modpack.slug
                          ) ? (
                          "Installed"
                        ) : !selectedGameId ? (
                          "Select Game"
                        ) : checkingInstallStatus &&
                          Object.keys(modInstallStatus).length === 0 ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            <span>Checking...</span>
                          </>
                        ) : (
                          "Install"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 mb-4">
            <div className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-lg w-fit mx-auto">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {getVisiblePages().map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={page === "..."}
                    className={`min-w-[32px] h-8 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 active:scale-95 ${
                      page === currentPage
                        ? "bg-primary text-white border border-primary shadow-md shadow-primary/20"
                        : page === "..."
                          ? "text-gray-400 cursor-default bg-transparent border-transparent"
                          : "text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
