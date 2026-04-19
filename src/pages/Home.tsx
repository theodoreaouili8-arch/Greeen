import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Download,
  RefreshCw,
  Film,
  AlertCircle,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */
interface VideoItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  downloadUrl: string;
  postUrl: string | null;
}

interface ApiVideosResponse {
  videos: VideoItem[];
  errors: string[];
  total: number;
}

/* ─── Sources list (for filter buttons) ─────────────── */
const SOURCES = [
  { label: "Tous", slug: "all" },
  { label: "Nacknaija", slug: "nacknaija" },
  { label: "Darknaija", slug: "darknaija" },
  { label: "Stellaplus", slug: "stellaplus" },
  { label: "Naijacum", slug: "naijacum" },
  { label: "Naijafap", slug: "naijafap" },
  { label: "Knackvideos", slug: "knackvideos" },
];

/* ─── VideoCard ───────────────────────────────────────── */
function VideoCard({
  video,
  onPlay,
  cardRef,
}: {
  video: VideoItem;
  onPlay: (v: VideoItem) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isBase64 = video.thumbnail?.startsWith("data:image");
  const showImg = video.thumbnail && !imgError && !isBase64;

  return (
    <div
      ref={cardRef}
      className="group bg-card border border-card-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
      data-testid={`card-video-${video.id}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {showImg ? (
          <img
            src={video.thumbnail!}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            data-testid={`img-thumbnail-${video.id}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
            <Film size={32} />
            <span className="text-xs font-medium">Apercu non disponible</span>
          </div>
        )}

        {/* Play overlay */}
        <button
          onClick={() => onPlay(video)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          aria-label="Lire la video"
          data-testid={`button-play-overlay-${video.id}`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </button>

        {/* Source badge */}
        <span className="absolute top-2 left-2 text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm capitalize">
          {video.slug}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-3 flex-1">
        <h3
          className="text-sm font-semibold text-foreground line-clamp-2 leading-snug"
          data-testid={`text-title-${video.id}`}
        >
          {video.title || "Titre non disponible"}
        </h3>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onPlay(video)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
            data-testid={`button-play-${video.id}`}
          >
            <Play size={13} fill="currentColor" />
            Regarder
          </button>
          <a
            href={video.downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-80 transition-opacity border border-secondary-border"
            data-testid={`button-download-${video.id}`}
          >
            <Download size={13} />
            Telecharger
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── VideoModal ──────────────────────────────────────── */
function VideoModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="modal-video"
    >
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground line-clamp-1 flex-1 pr-4">
            {video.title}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            data-testid="button-close-modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="w-full bg-black aspect-video">
          <video
            key={video.downloadUrl}
            src={video.downloadUrl}
            controls
            autoPlay
            className="w-full h-full"
            data-testid="player-video"
          >
            Votre navigateur ne supporte pas la lecture video.
          </video>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium capitalize">
            {video.slug}
          </span>
          <a
            href={video.downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="button-download-modal"
          >
            <Download size={13} />
            Telecharger
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── SkeletonCard ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-3 flex flex-col gap-3">
        <div className="h-3.5 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="flex gap-2 mt-1">
          <div className="h-8 flex-1 bg-muted rounded-lg" />
          <div className="h-8 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─── DeploySteps modal ───────────────────────────────── */
function DeployModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const steps = [
    {
      num: 1,
      title: "Telecharger le projet",
      desc: 'Cliquez sur "Download as zip" dans Replit pour obtenir les fichiers du projet.',
    },
    {
      num: 2,
      title: "Extraire le dossier",
      desc: "Extrayez le zip et naviguez vers le dossier artifacts/video-gallery.",
    },
    {
      num: 3,
      title: "Creer un compte Vercel",
      desc: "Rendez-vous sur vercel.com et creez un compte gratuit (GitHub recommande).",
    },
    {
      num: 4,
      title: "Importer le projet",
      desc: 'Cliquez "Add New Project" → importez depuis GitHub ou "Deploy from CLI".',
    },
    {
      num: 5,
      title: "Configurer le build",
      desc: 'Framework: Vite. Build command: "pnpm run build". Output: "dist/public".',
      code: true,
    },
    {
      num: 6,
      title: "Deployer !",
      desc: 'Cliquez "Deploy". Vercel construit et publie votre site en ~30 secondes.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Deployer sur Vercel</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {s.num}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                {s.code ? (
                  <>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{s.desc.split(".")[0]}.</p>
                    <div className="bg-muted rounded-lg px-3 py-2 font-mono text-xs text-foreground space-y-1">
                      <div><span className="text-muted-foreground">Framework:</span> Vite</div>
                      <div><span className="text-muted-foreground">Build:</span> pnpm run build</div>
                      <div><span className="text-muted-foreground">Output:</span> dist/public</div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                )}
              </div>
            </div>
          ))}

          <div className="mt-2 bg-accent rounded-xl p-4 text-xs text-accent-foreground">
            Le fichier <span className="font-mono font-bold">vercel.json</span> est deja inclus dans le projet. Il configure le routage et les fonctions serverless automatiquement.
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Ouvrir Vercel
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Home Page ───────────────────────────────────────── */
export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showDeploy, setShowDeploy] = useState(false);

  /* Ref for the sentinel element (last card trigger) */
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingMoreRef = useRef(false);

  /* ── Fetch a batch of videos from the backend proxy ── */
  const fetchBatch = useCallback(async (): Promise<{
    videos: VideoItem[];
    errors: number;
  }> => {
    const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
    const resp = await fetch(`${BASE}/api/videos`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data: ApiVideosResponse = await resp.json();
    /* Ensure unique IDs across batches */
    const withIds = data.videos.map((v) => ({
      ...v,
      id: `${v.slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    return { videos: withIds, errors: data.errors.length };
  }, []);

  /* ── Initial load ───────────────────────────────────── */
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setVideos([]);
    try {
      const { videos: batch, errors } = await fetchBatch();
      setVideos(batch);
      setErrorCount(errors);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchBatch]);

  /* ── Load more (infinite scroll) ───────────────────── */
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const { videos: batch } = await fetchBatch();
      setVideos((prev) => [...prev, ...batch]);
    } catch {
      /* silently skip on load-more errors */
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [fetchBatch]);

  /* ── IntersectionObserver on sentinel ──────────────── */
  useEffect(() => {
    if (loading) return;

    observerRef.current?.disconnect();

    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [loading, loadMore]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  /* ── Filtered videos ────────────────────────────────── */
  const filtered =
    activeFilter === "all"
      ? videos
      : videos.filter((v) => v.slug === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Film size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">VideoStream</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Galerie de videos en streaming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!loading && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {filtered.length} video{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => setShowDeploy(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors"
              data-testid="button-deploy-guide"
            >
              Deployer sur Vercel
            </button>
            <button
              onClick={loadInitial}
              disabled={loading || loadingMore}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              data-testid="button-refresh"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Source filter bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {SOURCES.map((s) => (
            <button
              key={s.slug}
              onClick={() => setActiveFilter(s.slug)}
              className={`shrink-0 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors ${
                activeFilter === s.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
              data-testid={`filter-${s.slug}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error */}
        {fetchError && !loading && (
          <div className="flex items-center gap-2.5 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>Erreur de chargement : {fetchError}</span>
          </div>
        )}
        {errorCount > 0 && !loading && !fetchError && (
          <div className="flex items-center gap-2.5 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              {errorCount} source{errorCount > 1 ? "s ont" : " a"} echoue. Seules les videos disponibles sont affichees.
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <>
            <div className="flex items-center gap-2 mb-6 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" />
              Chargement des videos depuis l'API...
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        )}

        {/* Empty (after filter) */}
        {!loading && filtered.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Film size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aucune video pour cette source</p>
              <p className="text-sm text-muted-foreground mt-1">
                Essayez un autre filtre ou actualisez.
              </p>
            </div>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Voir toutes les videos
            </button>
          </div>
        )}

        {/* Video grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              data-testid="grid-videos"
            >
              {filtered.map((video, idx) => (
                <VideoCard
                