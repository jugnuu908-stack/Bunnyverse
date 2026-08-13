import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { jkSongs, jkFacts, jkQuotes } from "../data/content";
import { playClick, playFlip } from "../lib/synth";

/* ---------------- YOUTUBE / MP3 helpers ---------------- */

const ytUrl = (_title: string, _artist: string, videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;

/* ---------------- YOUTUBE MUSIC PLAYER (official IFrame Player API) ---------------- */

let ytApiPromise: Promise<any> | null = null;
function loadYouTubeAPI(): Promise<any> {
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      const w = window as any;
      if (w.YT && w.YT.Player) {
        resolve(w.YT);
        return;
      }
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve(w.YT);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = () => reject(new Error("YouTube API failed to load"));
      document.head.appendChild(tag);
    });
  }
  return ytApiPromise;
}

function MusicPlayer({ onPlayingChange }: { onPlayingChange?: (p: boolean) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const idxRef = useRef(0);
  const pollRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const skipTimerRef = useRef<number | null>(null);
  const loadedIdRef = useRef<string>("");
  const lastNavRef = useRef(0);
  const endedHandledRef = useRef(false);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const track = jkSongs[idx];

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const stopPoll = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  const startPoll = () => {
    if (pollRef.current !== null) return;
    pollRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !player.getCurrentTime) return;
      try {
        const t = player.getCurrentTime() || 0;
        const d = player.getDuration() || 0;
        setCur(t);
        setDur(d);
        // reliable auto-next: a song has truly finished only when the player
        // reports ENDED and the playback clock has reached the end.
        // Spurious ENDED events from unloading videos are ignored.
        const st = player.getPlayerState ? player.getPlayerState() : -1;
        if (st === 0 && d > 5 && t >= d - 1.2 && !endedHandledRef.current) {
          endedHandledRef.current = true;
          applyTrackRef.current((idxRef.current + 1) % jkSongs.length);
        }
      } catch {
        /* player not ready yet */
      }
    }, 400);
  };

  /* ---------- single source of truth for changing tracks ---------- */
  const applyTrack = useCallback((i: number) => {
    idxRef.current = i;
    setIdx(i);
    setCur(0);
    setDur(0);
    setFailed(false);
    endedHandledRef.current = false;
    if (skipTimerRef.current !== null) {
      window.clearTimeout(skipTimerRef.current);
      skipTimerRef.current = null;
    }
    const player = playerRef.current;
    const id = jkSongs[i].videoId;
    if (player && player.cueVideoById && id) {
      try {
        player.cueVideoById(id); // load the track PAUSED — no autoplay
        loadedIdRef.current = id;
        setPlaying(false);
      } catch {
        setFailed(true);
      }
    }
  }, []);

  const applyTrackRef = useRef(applyTrack);
  useEffect(() => {
    applyTrackRef.current = applyTrack;
  }, [applyTrack]);

  // create one YouTube player instance (official IFrame API)
  useEffect(() => {
    let disposed = false;
    loadYouTubeAPI()
      .then((YT: any) => {
        if (disposed || !hostRef.current) return;
        const firstPlayable = jkSongs.find((s) => s.videoId);
        if (!firstPlayable) {
          setFailed(true);
          return;
        }
        playerRef.current = new YT.Player(hostRef.current, {
          videoId: firstPlayable.videoId as string,
          playerVars: {
            controls: 0,
            playsinline: 1,
            rel: 0,
            disablekb: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              startPoll();
              // cue track 1 PAUSED — the playlist always starts from track 1
              applyTrackRef.current(idxRef.current);
            },
            onStateChange: (e: any) => {
              if (e.data === 1) {
                setPlaying(true);
                setFailed(false);
              } else if (e.data === 2 || e.data === 3 || e.data === 5) {
                setPlaying(false);
              }
              // 0 (ENDED) is handled reliably by the time-poll above —
              // spurious ENDED events fired when a video is unloaded are ignored
            },
            onError: () => {
              // video failed → never leave the player stuck: skip to the next track
              setFailed(true);
              setPlaying(false);
              if (skipTimerRef.current !== null) window.clearTimeout(skipTimerRef.current);
              skipTimerRef.current = window.setTimeout(() => {
                applyTrackRef.current((idxRef.current + 1) % jkSongs.length);
              }, 2500);
            },
          },
        });
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      stopPoll();
      if (skipTimerRef.current !== null) window.clearTimeout(skipTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- transport controls ---------- */

  const goNext = () => {
    const now = Date.now();
    if (now - lastNavRef.current < 250) return; // prevent double-click spam
    lastNavRef.current = now;
    playClick();
    applyTrack((idxRef.current + 1) % jkSongs.length); // last song → loops to first
  };

  const goPrev = () => {
    const now = Date.now();
    if (now - lastNavRef.current < 250) return; // prevent double-click spam
    lastNavRef.current = now;
    playClick();
    // previous song — first song loops back to the last
    applyTrack((idxRef.current - 1 + jkSongs.length) % jkSongs.length);
  };

  const togglePlay = () => {
    playClick();
    const player = playerRef.current;
    if (!player || !player.playVideo) return;
    try {
      // read the REAL player state so the button always does the right thing
      const st = player.getPlayerState ? player.getPlayerState() : -1;
      if (st === 1) player.pauseVideo();
      else player.playVideo();
    } catch {
      /* ignore */
    }
  };

  /* ---------- progress bar (click / drag to seek) ---------- */

  const seekAt = (clientX: number) => {
    const bar = barRef.current;
    const player = playerRef.current;
    if (!bar || !player) return;
    try {
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const d = player.getDuration() || 0;
      if (d > 0) player.seekTo(ratio * d, true);
    } catch {
      /* ignore */
    }
  };

  const fmt = (s: number) => {
    const v = Math.floor(Math.max(0, s));
    return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
  };

  const ctrlBtn =
    "glass flex items-center justify-center rounded-full text-bora-200 transition-all duration-200 hover:border-fuchsia-400/60 hover:text-white hover:shadow-[0_0_18px_rgba(216,180,254,0.35)] active:scale-95";

  return (
    <div className="glass lift rounded-3xl p-6">
      {/* track counter */}
      <div className="mb-4 flex justify-center">
        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold text-bora-300">
          ♪ track {idx + 1} of {jkSongs.length} · auto-next on
        </span>
      </div>

      {/* track info */}
      <div className="text-center sm:text-left">
        <div className="truncate text-base font-bold text-white">{track.title}</div>
        <div className="truncate text-xs text-bora-200/60">{track.artist}</div>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-2.5 py-0.5 text-[9px] font-semibold tracking-wide text-fuchsia-300">
          ♪ now playing
        </div>
      </div>

      {/* video / auto-recovering on error */}
      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-bora-400/20 bg-night-900/80">
        <div ref={hostRef} className="h-full w-full" />
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-night-900/95 px-4 text-center">
            <p className="text-sm font-semibold text-bora-100">skipping to the next track…</p>
            <a
              href={ytUrl(track.title, track.artist, track.videoId)}
              target="_blank"
              rel="noreferrer"
              onClick={() => playClick()}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 px-5 py-2 text-xs font-bold text-red-200 ring-1 ring-red-400/40 transition-all hover:bg-red-600/35 hover:text-white"
            >
              WATCH ON YOUTUBE <span aria-hidden>→</span>
            </a>
          </div>
        )}
      </div>

      {/* transport controls — only 3: previous · play/pause · next */}
      <div className="mt-5 flex items-start justify-center gap-7 sm:gap-10">
        <div className="flex flex-col items-center gap-1.5">
          <button onClick={goPrev} aria-label="Previous song" title="Previous" className={`${ctrlBtn} h-12 w-12 text-xl`}>
            ⏮
          </button>
          <span className="text-[9px] font-semibold tracking-widest text-bora-200/50 uppercase">Previous</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
            className={`btn-bora flex h-14 w-14 items-center justify-center rounded-full text-white ${playing ? "animate-pulse-glow" : ""}`}
          >
            {playing ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
            ) : (
              <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <span className="text-[9px] font-semibold tracking-widest text-bora-200/50 uppercase">
            {playing ? "Pause" : "Play"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button onClick={goNext} aria-label="Next song" title="Next" className={`${ctrlBtn} h-12 w-12 text-xl`}>
            ⏭
          </button>
          <span className="text-[9px] font-semibold tracking-widest text-bora-200/50 uppercase">Next</span>
        </div>
      </div>

      {/* progress bar — synchronized with YouTube, click/drag to seek */}
      <div className="mt-4">
        <div
          ref={barRef}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.floor(dur) || 0}
          aria-valuenow={Math.floor(cur)}
          tabIndex={0}
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seekAt(e.clientX);
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) seekAt(e.clientX);
          }}
          onPointerUp={() => (draggingRef.current = false)}
          onPointerCancel={() => (draggingRef.current = false)}
          className="group/bar h-2.5 cursor-pointer touch-none overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-bora-500 to-fuchsia-500 transition-[width] duration-150"
            style={{ width: `${dur > 0 ? (cur / dur) * 100 : 0}%` }}
          >
            <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100" />
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-bora-200/50">
          <span>{fmt(cur)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HOW WELL DO YOU KNOW JK (flip cards) ---------------- */

function FactsPanel() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    playFlip();
    setFlipped((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  return (
    <div className="glass lift rounded-3xl p-6" id="facts">
      <div className="grid grid-cols-2 gap-2.5">
        {jkFacts.map((f, i) => (
          <button
            key={f.label}
            onClick={() => toggle(i)}
            className="flip-scene relative h-28 w-full"
            aria-label={`Flip fact: ${f.label}`}
          >
            <div className={`flip-inner h-full w-full ${flipped.has(i) ? "flipped" : ""}`}>
              <div className="flip-face flex flex-col items-center justify-center gap-1 rounded-2xl border border-bora-400/25 bg-gradient-to-br from-night-700 to-night-800 p-3 transition-colors hover:border-fuchsia-400/50">
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-[11px] font-bold text-white">{f.label}</span>
                <span className="text-[9px] text-bora-200/50">tap to flip 👆</span>
              </div>
              <div className="flip-face flip-back-face flex flex-col items-center justify-center gap-1 rounded-2xl border border-fuchsia-400/60 bg-gradient-to-br from-bora-600/40 to-fuchsia-600/30 p-3">
                <span className="text-center text-[11px] font-bold leading-snug text-white">{f.value}</span>
                <span className="text-[9px] uppercase tracking-wide text-bora-200/60">{f.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- MAIN SECTION ---------------- */

export default function JKZone() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setQuoteIdx((i) => (i + 1) % jkQuotes.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="jk-zone" className="relative z-10 overflow-x-clip py-24">
      {/* banner */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/jk-stage.jpg')", opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night-950/80 via-night-950/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h2 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
              The <span className="text-shine">Jung Kook</span> Zone
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-bora-200/75 sm:text-base">
              Everything I love about Jeon Jung Kook, collected in one place: music on repeat, facts
              I've memorized, and quotes that live in my head rent-free. No shoes on the couch — and
              yes, crying is encouraged.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5">
        {/* music + facts */}
        <div id="jk-music" className="scroll-mt-24 pt-10" />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* music player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="mx-auto w-full max-w-md rounded-3xl bg-gradient-to-b from-bora-600/15 to-transparent p-1.5 lg:max-w-none"
          >
            <MusicPlayer />
          </motion.div>

          {/* facts + quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto flex w-full max-w-md flex-col gap-4 lg:max-w-none"
          >
            <FactsPanel />

            <div key={quoteIdx} className="glass lift animate-pop-in rounded-3xl p-6 text-center sm:text-left">
              <p className="font-hand text-2xl leading-snug text-white">"{jkQuotes[quoteIdx].text}"</p>
              <p className="mt-2 text-xs tracking-widest text-fuchsia-300 uppercase">{jkQuotes[quoteIdx].by}</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
