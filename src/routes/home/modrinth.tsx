import Switch from "../../kit/Switch";
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
          `https://api.modrinth.com/v2/project/${mod.slug}/version?game_versions=["${gameVersion}"]`,
        );
        let versions = await res.json();
        if (loaderType) {
          versions = versions.filter(
            (v: any) =>
              (v.loaders &&
                v.loaders.some(
                  (l: string) => l.toLowerCase() === loaderType,
                )) ||
              (v.platforms &&
                v.platforms.some(
                  (p: string) => p.toLowerCase() === loaderType,
                )),
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
                          maxHeight: "300px",
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
                      document.body,
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
import { exists, readDir, remove } from "@tauri-apps/plugin-fs";
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
    {},
  );
  const [totalHits, setTotalHits] = useState<number>(0);
  const [loadingPages, setLoadingPages] = useState<{ [page: number]: boolean }>(
    {},
  );
  const remote = useRemote();
  const options = useOptions();
  const games: IGame[] = remote?.games || [];
  const [selectedGame, setSelectedGame] = useState<IGame | null>(() => {
    try {
      const stored = localStorage.getItem("selectedGame");
      if (stored) return JSON.parse(stored);
    } catch {}
    // Eğer localStorage'da yoksa, ilk oyunu seç
    return remote?.games && remote.games.length > 0 ? remote.games[0] : null;
  });
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
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);

  // Installed Mods için pagination
  const [installedPage, setInstalledPage] = useState(1);
  const installedModsPerPage = 12;

  // Profil oluşturma modalı için state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [localModFiles, setLocalModFiles] = useState<string[]>([]);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    loader: "fabric",
    loaderVersion: "",
    version: "latest",
    loaderDropdownOpen: false,
    loaderVersionDropdownOpen: false,
  });
  // Minecraft sürüm listesi için state
  const [mcVersions, setMcVersions] = useState<string[]>([]);
  // Loader sürüm listesi için state
  const [loaderVersions, setLoaderVersions] = useState<string[]>([]);
  // Versiyon dropdownu aç/kapa state
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);

  // Loader tipine göre minimum Minecraft sürümü
  const loaderMinVersion: Record<string, string> = {
    fabric: "1.14.4",
    forge: "1.5.2",
    quilt: "1.14.4",
    vanilla: "0",
  };

  function isVersionSupported(loader: string, version: string) {
    if (loader === "vanilla") return true;
    // Basit semver karşılaştırma (sadece major.minor.patch)
    const parse = (v: string) => v.split(".").map(Number);
    const vArr = parse(version);
    const minArr = parse(loaderMinVersion[loader] || "0");
    for (let i = 0; i < Math.max(vArr.length, minArr.length); i++) {
      const a = vArr[i] || 0;
      const b = minArr[i] || 0;
      if (a > b) return true;
      if (a < b) return false;
    }
    return true;
  }

  // Installed Mods sekmesi açıldığında dosya listesini tekrar oku
  useEffect(() => {
    (async () => {
      if (showInstalledOnly && selectedGame) {
        const modsPath = `${options.appDir}/profiles/${selectedGame.id}/mods`;
        const files = (await readDir(modsPath)).map((f) => f.name);
        setLocalModFiles(files || []);
      }
    })();
  }, [showInstalledOnly, selectedGame]);

  // Profil oluşturma modalı açıldığında Minecraft sürümlerini Mojang API'den çek
  useEffect(() => {
    if (showProfileModal) {
      fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")
        .then((res) => res.json())
        .then((data) => {
          const versions = data.versions.map((v: any) => v.id);
          setMcVersions(versions);
        })
        .catch(() => setMcVersions([]));
    }
  }, [showProfileModal]);

  // Loader sürümü dropdownu boşluğa tıklayınca kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".loader-version-dropdown") &&
        !target.closest('input[name="loaderVersion"]')
      ) {
        setProfileForm((f) => ({ ...f, loaderVersionDropdownOpen: false }));
      }
    }
    if (profileForm.loaderVersionDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [profileForm.loaderVersionDropdownOpen]);

  // Loader tipi ve Minecraft sürümü seçildiğinde loader sürümlerini çek
  useEffect(() => {
    async function fetchLoaderVersions() {
      if (!profileForm.loader || !profileForm.version) {
        setLoaderVersions([]);
        return;
      }
      let url = "";
      if (profileForm.loader === "fabric") {
        url = "https://meta.fabricmc.net/v2/versions/loader";
        const res = await fetch(url);
        const data = await res.json();
        const filtered = data.map((l: any) => l.version);
        setLoaderVersions(filtered);
      } else if (profileForm.loader === "quilt") {
        url = "https://meta.quiltmc.org/v3/versions/loader";
        const res = await fetch(url);
        const data = await res.json();
        const filtered = data.map((l: any) => l.version);
        setLoaderVersions(filtered);
      } else if (profileForm.loader === "forge") {
        url =
          "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json";
        const res = await fetch(url);
        const data = await res.json();
        setLoaderVersions(data[profileForm.version] || []);
      } else if (profileForm.loader === "neoforge") {
        url =
          "https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.json";
        const res = await fetch(url);
        const data = await res.json();
        // NeoForge için Minecraft sürümüne uygun loader versiyonlarını bul
        setLoaderVersions([]);
      }
    }
    fetchLoaderVersions();
  }, [profileForm.loader, profileForm.version]);

  // Modal dışına tıklanınca versiyon dropdownunu kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".version-dropdown") &&
        !target.closest('input[type="text"]')
      ) {
        setVersionDropdownOpen(false);
      }
    }
    if (versionDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [versionDropdownOpen]);

  useEffect(() => {
    async function fetchLocalMods() {
      if (!selectedGame) {
        setLocalModFiles([]);
        return;
      }
      const modsPath = `${options.appDir}/profiles/${selectedGame.id}/mods`;
      try {
        const files = (await readDir(modsPath)).map((f) => f.name);
        console.log(files);
        setLocalModFiles(files || []);
      } catch (ex) {
        console.log(ex);
        setLocalModFiles([]);
      }
    }
    fetchLocalMods();
  }, [selectedGame]);

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
          `https://api.modrinth.com/v2/search?query=${encodeURIComponent(search)}&limit=${modsPerPage}&offset=${offset}`,
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
              `https://api.modrinth.com/v2/project/${mod.slug}/version?game_versions=[\"${gameVersion}\"]`,
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
              results[mod.slug][v.id] =
                (await exists(modPath)) || (await exists(modPathWithV));
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
        }),
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
        `https://api.modrinth.com/v2/version/${versionId}`,
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
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  className="w-full px-4 py-3 backdrop-blur bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary transition-all duration-200 flex items-center justify-between group hover:bg-white/15"
                  onClick={() => setGameDropdownOpen((open) => !open)}
                  ref={dropdownBtnRef}
                >
                  <span className="text-sm truncate">
                    {selectedGame ? selectedGame.title || selectedGame.id : ""}
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
                <button
                  type="button"
                  className="px-4 py-3 backdrop-blur bg-white/10 border border-white/20 rounded-lg text-white flex items-center justify-center hover:bg-white/15 transition-colors"
                  style={{ height: "48px" }}
                  title="Create new profile"
                  onClick={() => setShowProfileModal(true)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                {/* Dropdown menüsü parent'a göre relative ve absolute olarak açılır */}
                {gameDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg shadow-xl border border-white/20 backdrop-blur bg-white/10 text-white overflow-hidden"
                    style={{
                      maxHeight: "60vh",
                      overflowY: "auto",
                    }}
                  >
                    {options.localProfiles &&
                      options.localProfiles.length > 0 && (
                        <>
                          <div className="px-4 py-2 font-bold text-xs text-primary/80">
                            Local Profiles
                          </div>
                          {options.localProfiles.map((game) => {
                            // Convert local profile to remote IGame type if needed
                            const toRemoteGame = (g: any): IGame => ({
                              ...g,
                              minecraft: {
                                ...g.minecraft,
                                exclude: g.minecraft?.exclude ?? [],
                                optionalMods: g.minecraft?.optionalMods ?? [],
                              },
                            });
                            return (
                              <button
                                key={game.id}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/20 transition-colors duration-150 flex items-center justify-between ${selectedGame?.id === game.id ? "bg-primary/30" : ""}`}
                                onClick={() => {
                                  setSelectedGame(toRemoteGame(game));
                                  try {
                                    localStorage.setItem(
                                      "selectedGame",
                                      JSON.stringify(game),
                                    );
                                  } catch {}
                                  setGameDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="truncate">
                                    {game.title || game.id}
                                  </span>
                                  <span className="ml-2 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                                    Local
                                  </span>
                                  <button
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    title="Delete profile"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (
                                        typeof options.removeLocalProfile ===
                                        "function"
                                      ) {
                                        options.removeLocalProfile(game.id);
                                        // Eğer silinen profil seçiliyse, başka bir profile geç
                                        if (selectedGame?.id === game.id) {
                                          const firstRemote = games.find(
                                            (g) =>
                                              !options.localProfiles?.some(
                                                (l) => l.id === g.id,
                                              ),
                                          );
                                          setSelectedGame(firstRemote || null);
                                        }
                                      }
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    <div className="px-4 py-2 font-bold text-xs text-primary/80">
                      Remote Profiles
                    </div>
                    {games
                      .filter(
                        (game) =>
                          !options.localProfiles?.some(
                            (local) => local.id === game.id,
                          ),
                      )
                      .map((game) => (
                        <button
                          key={game.id}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/20 transition-colors duration-150 flex items-center justify-between ${selectedGame?.id === game.id ? "bg-primary/30" : ""}`}
                          onClick={() => {
                            setSelectedGame(game);
                            try {
                              localStorage.setItem(
                                "selectedGame",
                                JSON.stringify(game),
                              );
                            } catch {}
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
                {/* Profil oluşturma modalı */}
                {showProfileModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdroblack/70 backdrop-blu-blur-sm-sm">
                    <div className="bg-dark rounded-2xl shadow-2xl p-8 w-[370px] flex flex-col gap-6 border border-white/10">
                      <h2 className="text-xl font-bold text-white mb-2">
                        Create New Profile
                      </h2>
                      <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-white">
                          Profile Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white focus:outline-none focus:border-primary transition"
                          value={profileForm.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setProfileForm((f) => ({
                              ...f,
                              name,
                              slug: name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, ""),
                            }));
                          }}
                          placeholder="My Profile"
                          autoFocus
                        />
                        <label className="text-sm font-medium text-white">
                          Minecraft Version
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white focus:outline-none focus:border-primary transition"
                            value={profileForm.version}
                            onFocus={() => setVersionDropdownOpen(true)}
                            onChange={(e) => {
                              setProfileForm((f) => ({
                                ...f,
                                version: e.target.value,
                              }));
                              setVersionDropdownOpen(true);
                            }}
                            placeholder="Search or type version..."
                            autoComplete="off"
                          />
                          {versionDropdownOpen &&
                            showProfileModal &&
                            mcVersions.length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl border border-white/20 bg-black/90 text-white z-50 version-dropdown">
                                {mcVersions
                                  .filter((ver) =>
                                    isVersionSupported(profileForm.loader, ver),
                                  )
                                  .filter((ver) =>
                                    ver
                                      .toLowerCase()
                                      .includes(
                                        profileForm.version.toLowerCase(),
                                      ),
                                  )
                                  .slice(0, 20)
                                  .map((ver) => (
                                    <button
                                      key={ver}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-primary/20 transition"
                                      onClick={() => {
                                        setProfileForm((f) => ({
                                          ...f,
                                          version: ver,
                                        }));
                                        setVersionDropdownOpen(false);
                                      }}
                                    >
                                      {ver}
                                    </button>
                                  ))}
                              </div>
                            )}
                        </div>
                        <label className="text-sm font-medium text-white">
                          Loader
                        </label>
                        <div className="flex gap-2 items-center w-full">
                          <div className="relative w-1/2">
                            <button
                              type="button"
                              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white flex items-center justify-between focus:outline-none focus:border-primary transition"
                              onClick={() =>
                                setProfileForm((f) => ({
                                  ...f,
                                  loaderDropdownOpen: !f.loaderDropdownOpen,
                                }))
                              }
                            >
                              <span>
                                {profileForm.loader.charAt(0).toUpperCase() +
                                  profileForm.loader.slice(1)}
                              </span>
                              <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                                  profileForm.loaderDropdownOpen
                                    ? "rotate-180"
                                    : ""
                                }`}
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
                            {profileForm.loaderDropdownOpen && (
                              <div className="absolute left-0 right-0 mt-1 rounded-lg shadow-xl border border-white/20 bg-black/90 text-white z-50">
                                {["fabric", "forge", "quilt", "neoforge"].map(
                                  (loader) => (
                                    <button
                                      key={loader}
                                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/20 transition ${
                                        profileForm.loader === loader
                                          ? "bg-primary/30"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setProfileForm((f) => ({
                                          ...f,
                                          loader,
                                          loaderDropdownOpen: false,
                                        }))
                                      }
                                    >
                                      {loader.charAt(0).toUpperCase() +
                                        loader.slice(1)}
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                          <div className="relative w-1/2">
                            <input
                              name="loaderVersion"
                              type="text"
                              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white focus:outline-none focus:border-primary transition"
                              value={profileForm.loaderVersion}
                              onFocus={() =>
                                setProfileForm((f) => ({
                                  ...f,
                                  loaderVersionDropdownOpen: true,
                                }))
                              }
                              onChange={(e) =>
                                setProfileForm((f) => ({
                                  ...f,
                                  loaderVersion: e.target.value,
                                  loaderVersionDropdownOpen: true,
                                }))
                              }
                              placeholder="Search or select loader version..."
                              autoComplete="off"
                            />
                            {profileForm.loaderVersionDropdownOpen &&
                              loaderVersions.length > 0 && (
                                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl border border-white/20 bg-black/90 text-white z-50 loader-version-dropdown">
                                  {loaderVersions
                                    .filter((ver) =>
                                      ver
                                        .toLowerCase()
                                        .includes(
                                          profileForm.loaderVersion.toLowerCase(),
                                        ),
                                    )
                                    .slice(0, 20)
                                    .map((ver) => (
                                      <button
                                        key={ver}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-primary/20 transition"
                                        onClick={() =>
                                          setProfileForm((f) => ({
                                            ...f,
                                            loaderVersion: ver,
                                            loaderVersionDropdownOpen: false,
                                          }))
                                        }
                                      >
                                        {ver}
                                      </button>
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition"
                          disabled={
                            !profileForm.name ||
                            !profileForm.loader ||
                            !profileForm.loaderVersion ||
                            !profileForm.version
                          }
                          onClick={async () => {
                            if (
                              !profileForm.name ||
                              !profileForm.loader ||
                              !profileForm.loaderVersion ||
                              !profileForm.version
                            )
                              return;
                            const newProfile = {
                              id: Math.random().toString(36).slice(2),
                              title: profileForm.name,
                              minecraft: {
                                version: profileForm.version,
                                loader: {
                                  type: profileForm.loader,
                                  version: profileForm.loaderVersion,
                                },
                              },
                            };
                            if (
                              options &&
                              typeof options.addLocalProfile === "function"
                            ) {
                              await options.addLocalProfile(newProfile);
                              // Ensure newProfile matches remote IGame type
                              const toRemoteGame = (g: any): IGame => ({
                                ...g,
                                minecraft: {
                                  ...g.minecraft,
                                  exclude: g.minecraft?.exclude ?? [],
                                  optionalMods: g.minecraft?.optionalMods ?? [],
                                },
                              });
                              setSelectedGame(toRemoteGame(newProfile));
                            }
                            setShowProfileModal(false);
                            setProfileForm({
                              name: "",
                              loader: "fabric",
                              loaderVersion: "",
                              version: "latest",
                              loaderDropdownOpen: false,
                              loaderVersionDropdownOpen: false,
                            });
                          }}
                        >
                          Create
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-black/30 text-white font-semibold hover:bg-black/50 transition"
                          onClick={() => {
                            setShowProfileModal(false);
                            setProfileForm({
                              name: "",
                              loader: "fabric",
                              loaderVersion: "",
                              version: "latest",
                              loaderDropdownOpen: false,
                              loaderVersionDropdownOpen: false,
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* gameDropdownOpen block removed, handled above */}
              </div>
            </div>
          </div>

          {/* Filter Bar + Pagination */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <button
                className={`px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white transition-colors ${showInstalledOnly ? "" : "bg-primary/30"}`}
                onClick={() => setShowInstalledOnly(false)}
              >
                All Mods
              </button>
              <button
                className={`px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white transition-colors ${showInstalledOnly ? "bg-primary/30" : ""}`}
                onClick={() => setShowInstalledOnly(true)}
              >
                Installed Mods
              </button>
            </div>
            {/* All Mods Pagination Bar */}
            {!showInstalledOnly && (
              <div className="flex items-center gap-2">
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
                    className="w-12 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-center"
                  />
                  <span className="text-white/60 text-xs">
                    / {Math.max(1, Math.ceil(totalHits / modsPerPage))}
                  </span>
                </div>
                <button
                  className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={page >= Math.ceil(totalHits / modsPerPage)}
                  onClick={() => {
                    setPage((p) => {
                      const np = Math.min(
                        Math.ceil(totalHits / modsPerPage),
                        p + 1,
                      );
                      setPageInput(np.toString());
                      return np;
                    });
                  }}
                >
                  Next
                </button>
              </div>
            )}
            {/* Installed Mods Pagination Bar */}
            {showInstalledOnly &&
              localModFiles.length > installedModsPerPage && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                    disabled={installedPage === 1}
                    onClick={() => setInstalledPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="mx-2 text-white/70 text-xs">
                    Page {installedPage} /{" "}
                    {Math.ceil(localModFiles.length / installedModsPerPage)}
                  </span>
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                    disabled={
                      installedPage >=
                      Math.ceil(localModFiles.length / installedModsPerPage)
                    }
                    onClick={() =>
                      setInstalledPage((p) =>
                        Math.min(
                          Math.ceil(
                            localModFiles.length / installedModsPerPage,
                          ),
                          p + 1,
                        ),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
          </div>

          <div className="flex flex-col">
            {/* Installed Mods grid */}
            <div className="grid grid-cols-3 gap-3">
              {showInstalledOnly ? (
                localModFiles.length === 0 ? (
                  <div className="col-span-3 flex items-center justify-center h-[120px]">
                    <span className="text-lg text-white/70 font-semibold">
                      No mods installed.
                    </span>
                  </div>
                ) : (
                  (() => {
                    const pagedLocalMods = localModFiles.slice(
                      (installedPage - 1) * installedModsPerPage,
                      installedPage * installedModsPerPage,
                    );
                    return pagedLocalMods.map((file) => {
                      const isDisabled = file.endsWith(".disabled");
                      const fileName = file.replace(/\.disabled$/, "");
                      const modsPath = `${options.appDir}/profiles/${selectedGame?.id}/mods`;
                      return (
                        <div
                          key={file}
                          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur rounded-lg border border-primary/20 hover:border-primary transition-colors duration-200 cursor-pointer p-2 flex items-center min-h-[70px] shadow"
                        >
                          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center mr-3">
                            <svg
                              className="w-6 h-6 text-primary/80"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16V4a2 2 0 012-2h8a2 2 0 012 2v12m-6 4h6a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="font-semibold text-base break-words whitespace-normal text-left">
                              {fileName}
                            </span>
                            <span
                              className={`mt-1 px-2 py-0.5 rounded text-xs font-medium w-fit ${isDisabled ? "bg-yellow-600 text-white" : "bg-green-600 text-white"}`}
                            >
                              {isDisabled ? "Disabled" : "Active"}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center ml-2">
                            <button
                              title={isDisabled ? "Enable mod" : "Disable mod"}
                              className="p-1 rounded-full bg-black/30 hover:bg-primary/60 transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const oldPath = `${modsPath}/${file}`;
                                const newPath = isDisabled
                                  ? `${modsPath}/${fileName}`
                                  : `${modsPath}/${fileName}.disabled`;
                                try {
                                  await window.electronAPI.renameFile(
                                    oldPath,
                                    newPath,
                                  );
                                  const files =
                                    await window.electronAPI.readDir(modsPath);
                                  setLocalModFiles(files || []);
                                } catch {}
                              }}
                            >
                              {isDisabled ? (
                                <svg
                                  className="w-5 h-5 text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-yellow-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              title="Delete mod"
                              className="p-1 rounded-full bg-black/30 hover:bg-red-600 transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const delPath = `${modsPath}/${file}`;
                                try {
                                  await window.electronAPI.deleteFile(delPath);
                                  const files =
                                    await window.electronAPI.readDir(modsPath);
                                  setLocalModFiles(files || []);
                                } catch {}
                              }}
                            >
                              <svg
                                className="w-5 h-5 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 3h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()
                )
              ) : (
                (() => {
                  let modsToShow: ModPack[] = modsByPage[page] || [];
                  if (modsToShow.length === 0) {
                    return (
                      <div className="col-span-3 flex items-center justify-center h-[120px]">
                        <span className="text-lg text-white/70 font-semibold">
                          No mods found.
                        </span>
                      </div>
                    );
                  }
                  return modsToShow.map((mod) => (
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
                        const gameId = selectedGame.id;
                        const modsPath = `${options.appDir}/profiles/${gameId}/mods`;
                        setInstalledMods((prev) => {
                          const copy = { ...prev };
                          delete copy[mod.slug];
                          return copy;
                        });
                      }}
                    />
                  ));
                })()
              )}
            </div>
            {/* Installed Mods Pagination */}
            {/* Artık üstte, başlığın yanında gösteriliyor */}
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
