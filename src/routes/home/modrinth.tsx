// ...existing code...
// Handles fetching mod versions and passing props to ModCard
// Place interface at top level
interface ModCardWithVersionsProps {
  mod: any;
  selectedGame?: any;
  installedMods: Record<string, boolean>;
  selectedVersions: Record<string, string>;
  setSelectedVersions: (fn: (prev: any) => any) => void;
  onInstall: () => void;
  onRemove: () => void;
}

function ModCardWithVersions(props: ModCardWithVersionsProps) {
  const {
    mod,
    selectedGame,
    installedMods,
    selectedVersions,
    setSelectedVersions,
    onInstall,
    onRemove,
  } = props;
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  function shortenVersionName(name: string) {
    if (!name) return "";
    let short = name.replace(/([a-f0-9]{8,})/gi, "").trim();
    if (short.length > 26) short = short.slice(0, 24) + "...";
    return short;
  }

  // Fetch mod versions
  const [modVersions, setModVersions] = useState<any[]>([]);
  useEffect(() => {
    let ignore = false;
    async function fetchVersions() {
      if (!selectedGame) return setModVersions([]);
      try {
        const gameVersion = selectedGame.minecraft?.version;
        const loaderType = selectedGame.minecraft?.loader?.type?.toLowerCase();
        const res = await fetch(
          `https://api.modrinth.com/v2/project/${mod.slug}/version?game_versions=["${gameVersion}"]`
        );
        let versions = await res.json();
        console.log(versions);
        if (loaderType) {
          versions = versions.filter(
            (v: any) =>
              (v.loaders &&
                v.loaders.some(
                  (l: string) => l.toLowerCase() === loaderType
                )) ||
              (v.platforms &&
                v.platforms.some((p: string) => p.toLowerCase() === loaderType))
          );
        }
        if (!ignore) setModVersions(versions);
      } catch {
        if (!ignore) setModVersions([]);
      }
      return () => {
        ignore = true;
      };
    }
    fetchVersions();
  }, [mod.slug, selectedGame]);

  // Selected version logic
  // Always default to latest version if not set
  const selectedVersionId =
    selectedVersions[mod.slug] ??
    (modVersions.length > 0 ? modVersions[0].id : "");
  // If not set, set to latest on mount
  useEffect(() => {
    if (modVersions.length > 0 && !selectedVersions[mod.slug]) {
      setSelectedVersions((prev) => ({
        ...prev,
        [mod.slug]: modVersions[0].id,
      }));
    }
  }, [modVersions, mod.slug, selectedVersions, setSelectedVersions]);
  const installed = !!(
    selectedVersionId &&
    installedMods &&
    installedMods[selectedVersionId]
  );
  const incompatible = !selectedGame || modVersions.length === 0;
  return (
    <ModCard
      mod={mod}
      selectedGame={selectedGame}
      installed={installed}
      incompatible={incompatible}
      modVersions={modVersions}
      selectedVersionId={selectedVersionId}
      onSelectVersion={(versionId) =>
        setSelectedVersions((prev: any) => ({ ...prev, [mod.slug]: versionId }))
      }
      onInstall={() => onInstall()}
      onRemove={onRemove}
      versionDropdownOpen={versionDropdownOpen}
      setVersionDropdownOpen={setVersionDropdownOpen}
      shortenVersionName={shortenVersionName}
    />
  );
}

// Sadece install butonlu mod kartı
interface ModCardProps {
  versionDropdownOpen?: boolean;
  setVersionDropdownOpen?: (open: boolean) => void;
  shortenVersionName?: (name: string) => string;
  mod: ModPack;
  selectedGame: IGame | null;
  installed: boolean;
  incompatible: boolean;
  modVersions: any[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
  onInstall: () => void;
  onRemove: () => void;
}

function ModCard({
  mod,
  selectedGame,
  installed,
  incompatible,
  modVersions,
  selectedVersionId,
  onSelectVersion,
  onInstall,
  onRemove,
  versionDropdownOpen,
  setVersionDropdownOpen,
  shortenVersionName,
}: ModCardProps) {
  // Dropdown pozisyonu için ref ve state
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
    width: number;
    openUpwards?: boolean;
  } | null>(null);

  useEffect(() => {
    if (versionDropdownOpen && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      const dropdownHeight = 48 * (modVersions.length || 1); // tahmini yükseklik: 48px * eleman sayısı
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top = rect.bottom + window.scrollY;
      let openUpwards = false;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight;
        openUpwards = true;
      }
      setDropdownPosition({
        left: rect.left,
        top,
        width: rect.width,
        openUpwards,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [versionDropdownOpen, modVersions]);

  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur rounded-lg border border-primary/20 hover:border-primary transition-colors duration-200 cursor-pointer p-3">
      <div className="flex items-start gap-3">
        {mod.icon_url ? (
          <img
            src={mod.icon_url}
            alt={mod.title}
            className="w-12 h-12 rounded-lg object-cover bg-white/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/20" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
            {mod.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
            {mod.description}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {mod.downloads?.toLocaleString()} downloads
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Custom dropdown for mod versions */}
            <div className="relative min-w-[120px]" data-version-dropdown>
              {selectedVersionId && (
                <>
                  <button
                    type="button"
                    className="w-full px-4 py-3 h-8 backdrop-blur bg-white/10 border border-white/20 rounded-lg text-black dark:text-white focus:outline-none focus:border-primary transition-all duration-200 flex items-center justify-between group hover:bg-white/15"
                    disabled={modVersions.length === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVersionDropdownOpen &&
                        setVersionDropdownOpen(!versionDropdownOpen);
                    }}
                    ref={dropdownBtnRef}
                  >
                    <span className="text-sm truncate">
                      {modVersions.length === 0
                        ? "No compatible version"
                        : (modVersions.find((v) => v.id === selectedVersionId)
                            ?.version_number ?? modVersions[0].version_number)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-black/60 dark:text-white/60 ml-2 transition-transform duration-200 ${versionDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {versionDropdownOpen &&
                    modVersions.length > 0 &&
                    dropdownPosition &&
                    createPortal(
                      <div
                        style={{
                          position: "absolute",
                          left: dropdownPosition.left,
                          top: dropdownPosition.top,
                          width: dropdownPosition.width,
                          zIndex: 2000,
                          maxHeight: "60vh",
                          overflowY: "auto",
                        }}
                        className={`rounded-lg shadow-xl border border-white/20 backdrop-blur bg-white/10 text-black dark:text-white overflow-hidden ${dropdownPosition.openUpwards ? "mb-2" : "mt-2"}`}
                        data-version-dropdown-portal
                      >
                        {modVersions.map((v: any) => (
                          <button
                            key={v.id}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/20 transition-colors duration-150 ${selectedVersionId === v.id ? "bg-primary/30" : ""}`}
                            onClick={() => {
                              onSelectVersion(v.id);
                              setVersionDropdownOpen &&
                                setVersionDropdownOpen(false);
                            }}
                          >
                            <span className="truncate">
                              {shortenVersionName &&
                                shortenVersionName(v.version_number)}
                            </span>
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                </>
              )}
            </div>
            {installed ? (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded bg-green-600 text-white">
                  Installed
                </span>
                <button
                  className="px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={onRemove}
                >
                  Remove
                </button>
              </>
            ) : incompatible ? (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-500 text-white">
                Incompatible
              </span>
            ) : (
              <button
                className="px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 bg-primary hover:bg-primary/80 text-white"
                disabled={!selectedGame || !selectedVersionId}
                onClick={onInstall}
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { downloadFile } from "@/tauri/commands";
import { useOptions } from "@/store/options";
import { useRemote, IGame } from "@/store/remote";
import { exists, remove } from "@tauri-apps/plugin-fs";
import Alert from "@/kit/alert";
import { fetch } from "@tauri-apps/plugin-http";

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

// Dummy mod data (replace with API fetch)
const DUMMY_MODS: ModPack[] = [
  {
    slug: "mod1",
    title: "OptiFine",
    description: "Optimize your Minecraft experience.",
    downloads: 12345,
    project_id: "1",
  },
  {
    slug: "mod2",
    title: "JourneyMap",
    description: "Map your world as you explore.",
    downloads: 54321,
    project_id: "2",
  },
  {
    slug: "mod3",
    title: "JEI",
    description: "Just Enough Items for recipes.",
    downloads: 99999,
    project_id: "3",
  },
];

function RouteComponent() {
  // Dropdown state for game selector (single boolean)
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);
  // State
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const modsPerPage = 9;
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [modsByPage, setModsByPage] = useState<{ [page: number]: ModPack[] }>(
    {}
  );
  const [totalHits, setTotalHits] = useState<number>(0);
  const [loadingPages, setLoadingPages] = useState<{ [page: number]: boolean }>(
    {}
  );
  const remote = useRemote();
  const options = useOptions();
  const games: IGame[] = remote?.games || [];
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);
  // installedMods: { [slug]: { [versionId: string]: boolean } }
  const [installedMods, setInstalledMods] = useState<{
    [slug: string]: { [versionId: string]: boolean };
  }>({});
  // Seçilen modun versiyonu: { [slug]: versionId }
  const [selectedVersions, setSelectedVersions] = useState<{
    [slug: string]: string;
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMod, setModalMod] = useState<ModPack | null>(null);
  const [checkingMods, setCheckingMods] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);

  // Kapanma için dışarıya tıklma
  useEffect(() => {
    if (!gameDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-game-dropdown]")) {
        setGameDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [gameDropdownOpen]);

  // Her sayfa için modları ayrı ayrı çek
  useEffect(() => {
    if (searching) return;
    const fetchPage = async (pageNum: number, silent = false) => {
      setLoadingPages((lp) => ({ ...lp, [pageNum]: !silent }));
      try {
        const offset = (pageNum - 1) * modsPerPage;
        const res = await fetch(
          `https://api.modrinth.com/v2/search?query=${encodeURIComponent(search)}&limit=${modsPerPage}&offset=${offset}`
        );
        const data = await res.json();
        const mods: ModPack[] = (data.hits || []).map((mod: any) => ({
          slug: mod.slug,
          title: mod.title,
          description: mod.description,
          icon_url: mod.icon_url,
          downloads: mod.downloads,
          project_id: mod.project_id,
        }));
        setModsByPage((prev) => ({ ...prev, [pageNum]: mods }));
        if (typeof data.total_hits === "number") setTotalHits(data.total_hits);
      } catch {
        setModsByPage((prev) => ({ ...prev, [pageNum]: DUMMY_MODS }));
        setTotalHits(DUMMY_MODS.length);
      } finally {
        setLoadingPages((lp) => ({ ...lp, [pageNum]: false }));
      }
    };
    // Aktif sayfa fetch
    if (!modsByPage[page] && !loadingPages[page]) fetchPage(page);
    // İlk sayfa ise arka planda 2. sayfayı da fetch et
    if (page === 1 && !modsByPage[2] && !loadingPages[2]) fetchPage(2, true);
    // Arama değişirse 1. sayfayı fetchle ve inputu sıfırla
    if (page === 1 && !modsByPage[1]) fetchPage(1);
    // eslint-disable-next-line
  }, [page, search, searching]);

  // Arama input debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSearching(true);
    setPage(1);
    setPageInput("1");
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setSearching(false);
      setModsByPage({});
    }, 700); // 700ms debounce
  };

  // Mod dosya adlarını cache'lemek için
  const modFileNameCache = useRef<{ [slug: string]: string }>({});

  useEffect(() => {
    const currentMods = modsByPage[page] || [];
    if (!selectedGame || currentMods.length === 0) {
      setInstalledMods({});
      setCheckingMods(false);
      return;
    }
    const checkMods = async () => {
      setCheckingMods(true);
      const results: { [slug: string]: { [versionId: string]: boolean } } = {};
      const modsPath = `${options.appDir}/profiles/${selectedGame.id}/mods`;
      await Promise.all(
        currentMods.map(async (mod) => {
          // Tüm versiyonları çek
          const gameVersion = selectedGame.minecraft?.version;
          let modVersions: any[] = [];
          try {
            const res = await fetch(
              `https://api.modrinth.com/v2/project/${mod.slug}/version?game_versions=[\"${gameVersion}\"]`
            );
            modVersions = await res.json();
          } catch {}
          results[mod.slug] = {};
          for (const v of modVersions) {
            const fileObj = v.files?.[0];
            let fileName = fileObj?.filename || `${mod.slug}.jar`;
            const modPath = `${modsPath}/${fileName}`;
            try {
                // Add -v before .jar in the filename
                const fileNameWithV = fileName.replace(/\.jar$/, "-v.jar");
                const modPathWithV = `${modsPath}/${fileNameWithV}`;
                results[mod.slug][v.id] = await exists(modPath) || await exists(modPathWithV) 
            } catch {
              results[mod.slug][v.id] = false;
            }
          }
          // Varsayılan seçili versiyon: en güncel
          if (modVersions.length > 0 && !(mod.slug in selectedVersions)) {
            setSelectedVersions((prev) => ({
              ...prev,
              [mod.slug]: modVersions[0].id,
            }));
          }
        })
      );
      setInstalledMods(results);
      setCheckingMods(false);
    };
    checkMods();
  }, [selectedGame, modsByPage, options.appDir, page]);

  // Yükleme işlemi
  const handleInstall = async (mod: ModPack) => {
    if (!selectedGame) return;
    setModalMod(mod);
    setShowModal(true);
    try {
      // Seçili versiyonu bul
      const versionId = selectedVersions[mod.slug];
      if (!versionId) throw new Error("Mod versiyonu seçilmedi.");
      // Versiyon detayını çek
      const res = await fetch(
        `https://api.modrinth.com/v2/version/${versionId}`
      );
      const version = await res.json();
      const fileObj = version.files?.[0];
      if (!fileObj || !fileObj.url || !fileObj.filename)
        throw new Error("Mod dosyası bulunamadı.");
      const modsPath = `${options.appDir}/profiles/${selectedGame.id}/mods`;
      await downloadFile(fileObj.url, `${modsPath}/${fileObj.filename}`);
      setInstalledMods((prev) => ({
        ...prev,
        [mod.slug]: { ...prev[mod.slug], [versionId]: true },
      }));
    } catch (err) {
      let msg = "Bilinmeyen hata";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as any).message;
      } else if (typeof err === "string") {
        msg = err;
      }
      Alert({ title: "İndirme Hatası", message: "Mod indirilemedi: " + msg });
    } finally {
      setShowModal(false);
    }
  };

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
                className="w-full px-4 py-3 pl-11 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary transition-colors"
                value={search}
                onChange={handleSearchChange}
                disabled={searching}
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

            <div className="min-w-[220px] relative" data-game-dropdown>
              <label className="block text-xs mb-1">Install to Game:</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 backdrop-blur bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition-all duration-200 flex items-center justify-between group hover:bg-white/15"
                  onClick={() => setGameDropdownOpen((open) => !open)}
                >
                  <span className="text-sm truncate">
                    {selectedGame
                      ? selectedGame.title || selectedGame.id
                      : "Select a game..."}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/60 ml-2 transition-transform duration-200 ${gameDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {gameDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 mt-2 z-500 rounded-lg shadow-xl border border-white/20 backdrop-blur bg-white/10 text-white overflow-hidden"
                    style={{ background: "rgba(30,30,30,0.7)" }}
                  >
                    {games.map((game) => (
                      <button
                        key={game.id}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/20 transition-colors duration-150 ${selectedGame?.id === game.id ? "bg-primary/30" : ""}`}
                        onClick={() => {
                          setSelectedGame(game);
                          setGameDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {game.title || game.id}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(modsByPage[page] || []).map((mod) => (
              <ModCardWithVersions
                key={mod.slug}
                mod={mod}
                selectedGame={selectedGame}
                installedMods={installedMods[mod.slug] || {}}
                selectedVersions={selectedVersions}
                setSelectedVersions={setSelectedVersions}
                onInstall={() => handleInstall(mod)}
                onRemove={async () => {
                  if (!selectedGame) return;
                  const modsPath = `${options.appDir}/profiles/${selectedGame.id}/mods`;
                  const versionId = selectedVersions[mod.slug];
                  // Modun versiyonunu bul
                  let fileName = null;
                  try {
                    const res = await fetch(`https://api.modrinth.com/v2/version/${versionId}`);
                    const version = await res.json();
                    fileName = version.files?.[0]?.filename || `${mod.slug}.jar`;
                  } catch {
                    fileName = `${mod.slug}.jar`;
                  }
                  // Hem normal hem -v.jar dosyasını sil
                  const filePath = `${modsPath}/${fileName}`;
                  const filePathV = fileName.endsWith('.jar') ? `${modsPath}/${fileName.replace(/\.jar$/, '-v.jar')}` : null;
                  try { await remove(filePath); } catch {}
                  if (filePathV) { try { await remove(filePathV); } catch {} }
                  setInstalledMods((prev) => ({ ...prev, [mod.slug]: {} }));
                  setSelectedVersions((prev) => ({ ...prev, [mod.slug]: "" }));
                  setModalMod(null);
                  setShowModal(false);
                }}
              />
            ))}
          </div>

          <div className="mt-8 mb-4">
            <div className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-lg w-fit mx-auto">
              <button
                className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => {
                    const np = Math.max(1, p - 1);
                    setPageInput(np.toString());
                    return np;
                  });
                }}
              >
                Previous
              </button>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, Math.ceil(totalHits / modsPerPage))}
                  value={pageInput}
                  onChange={(e) =>
                    setPageInput(e.target.value.replace(/^0+/, ""))
                  }
                  onBlur={() => {
                    let n = parseInt(pageInput, 10);
                    if (isNaN(n) || n < 1) n = 1;
                    if (n > Math.ceil(totalHits / modsPerPage))
                      n = Math.ceil(totalHits / modsPerPage);
                    setPage(n);
                    setPageInput(n.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      let n = parseInt(pageInput, 10);
                      if (isNaN(n) || n < 1) n = 1;
                      if (n > Math.ceil(totalHits / modsPerPage))
                        n = Math.ceil(totalHits / modsPerPage);
                      setPage(n);
                      setPageInput(n.toString());
                    }
                  }}
                  className="w-12 h-8 text-center rounded bg-black/40 border border-white/20 text-white mx-1 focus:outline-none focus:border-primary"
                  style={{ MozAppearance: "textfield" }}
                />
                <span className="text-white/70 text-xs">
                  / {Math.max(1, Math.ceil(totalHits / modsPerPage))}
                </span>
              </div>
              <button
                className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={
                  page === Math.max(1, Math.ceil(totalHits / modsPerPage))
                }
                onClick={() => {
                  setPage((p) => {
                    const np = Math.min(
                      Math.max(1, Math.ceil(totalHits / modsPerPage)),
                      p + 1
                    );
                    setPageInput(np.toString());
                    return np;
                  });
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Yükleme Modalı */}
      {(showModal && modalMod) ||
      (loadingPages[page] && !(modsByPage[page] && modsByPage[page].length)) ||
      (!modsByPage[page] && !loadingPages[page]) ||
      checkingMods ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg w-[350px] text-center">
            <h2 className="text-lg font-bold mb-2">Mod Yükleniyor</h2>
            <p className="mb-4">Modlar kontrol ediliyor...</p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-2 bg-primary animate-pulse"
                style={{ width: "100%" }}
              />
            </div>
            <span className="text-xs text-gray-500">
              Lütfen bekleyin, modlar kontrol ediliyor veya yükleniyor.
            </span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
