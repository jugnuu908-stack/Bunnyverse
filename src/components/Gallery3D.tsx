import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SectionTitle } from "./effects";
import { playClick, playFlip } from "../lib/synth";
import { JK_PHOTOS, wm } from "../lib/commons";

/* ============================================================
   JUNG KOOK ✦ IN 3D — a floating 3D card carousel.
   36 real Jung Kook photos (Wikimedia Commons, CC-licensed).
   Every card always shows something: the photo loads with a
   designed era card behind it as a graceful fallback.
   ============================================================ */

interface GCard {
  title: string;
  src: string;
  palette: string;
  icon: string;
}

const PALETTES = [
  "from-amber-400/70 via-fuchsia-600/50 to-purple-900/80",
  "from-purple-700/70 via-indigo-700/50 to-night-900/80",
  "from-fuchsia-600/70 via-pink-600/50 to-night-900/80",
  "from-violet-600/70 via-purple-700/50 to-night-900/80",
  "from-indigo-700/70 via-blue-800/50 to-night-900/80",
  "from-rose-600/70 via-purple-800/50 to-night-900/80",
];

const ICONS = ["✨", "🎤", "☀️", "🕊️", "🌧️", "💜"];

const CARDS: GCard[] = JK_PHOTOS.map((p, i) => ({
  title: p.title,
  src: wm(p.file, 800),
  palette: PALETTES[i % PALETTES.length],
  icon: ICONS[i % ICONS.length],
}));

/* Every card always shows something beautiful.
   Real image when it loads → designed era card until then (never broken). */
function CardImage({ card, index, total }: { card: GCard; index: number; total: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* real image (existing asset or your own /gallery file) */}
      {!failed && (
        <img
          src={card.src}
          alt={`Jung Kook — ${card.title}`}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* designed era card — shown until the photo exists (never blank) */}
      {failed && (
        <div className={`absolute inset-0 bg-gradient-to-br ${card.palette}`}>
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
          <div className="absolute -right-6 -top-6 text-[7rem] opacity-10">{card.icon}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-hand text-4xl text-white/85 drop-shadow-[0_2px_12px_rgba(10,2,20,0.6)]">
              {card.title}
            </span>
          </div>
        </div>
      )}

      {/* caption overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950/90 via-night-950/45 to-transparent px-3 pt-8 pb-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] text-white">{card.title.toUpperCase()}</span>
          <span className="font-hand text-sm text-fuchsia-300">
            {String(index + 1).padStart(2, "0")} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Gallery3D() {
  const N = CARDS.length;
  const [active, setActive] = useState(0);
  const [stageW, setStageW] = useState(560);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startCard = useRef(-1);
  const lastWheel = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const next = useCallback(() => {
    playClick();
    setActive((a) => (a + 1) % N);
  }, [N]);

  const prev = useCallback(() => {
    playFlip();
    setActive((a) => (a - 1 + N) % N);
  }, [N]);

  /* ---- slow cinematic auto-rotation (paused while the user interacts) ---- */
  const pauseAuto = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const scheduleResume = () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    if (reduced) return; // accessibility: no forced continuous motion
    const id = window.setInterval(() => {
      if (!pausedRef.current) setActive((a) => (a + 1) % N);
    }, 4000); // AUTO SLIDE MODE — all 36 cards, one every 4 seconds, endlessly
    return () => window.clearInterval(id);
  }, [reduced, N]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    },
    []
  );

  /* measure the stage so sizes stay perfectly centered at every viewport */
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* keyboard navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  /* ---- drag / swipe (pauses auto-rotation, resumes ~2.5s later) ---- */
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pauseAuto();
    startX.current = e.clientX;
    const target = (e.target as HTMLElement).closest("[data-card]") as HTMLElement | null;
    startCard.current = target ? Number(target.dataset.card) : -1;
    setDragging(true);
    setDrag(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDrag(e.clientX - startX.current);
  };

  const onUp = () => {
    if (!dragging) return;
    const d = drag;
    setDragging(false);
    setDrag(0);
    if (Math.abs(d) > 70) {
      if (d < 0) next();
      else prev();
    } else if (Math.abs(d) <= 10 && startCard.current >= 0 && startCard.current !== active) {
      playFlip();
      setActive(startCard.current);
    }
    scheduleResume();
  };

  /* mouse wheel (throttled) */
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheel.current < 450) return;
    lastWheel.current = now;
    pauseAuto();
    if (e.deltaY > 0) next();
    else prev();
    scheduleResume();
  };

  /* sizes derived from the measured stage — always centered, never overflowing.
     Phones get their own 3D configuration: bigger card, tighter spacing,
     smaller rotation/depth so the active card stays large and fully visible. */
  const compact = stageW < 480;
  const cardW = compact
    ? Math.max(118, Math.min(200, stageW * 0.42))
    : Math.max(140, Math.min(250, stageW * 0.3));
  const spacing = compact ? stageW * 0.26 : Math.max(76, Math.min(210, stageW * 0.26));
  const depth = compact ? Math.max(30, stageW * 0.06) : Math.max(50, Math.min(140, stageW * 0.12));
  const angle = compact ? 18 : 26;
  const stageH = Math.round(cardW * 1.5 + 50);

  return (
    <section id="jk-3d" className="relative z-10 overflow-x-clip py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle title="JUNG KOOK GALLERY ✦" />

        <div className="relative mx-auto max-w-5xl">
          {/* soft atmosphere */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/15 blur-[90px]"
            style={{ width: "72%", height: "72%" }}
          />
          {[
            { x: "6%", y: "18%" },
            { x: "92%", y: "26%" },
            { x: "14%", y: "78%" },
            { x: "86%", y: "70%" },
            { x: "50%", y: "8%" },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                left: s.x,
                top: s.y,
                animation: `twinkle ${3 + i}s ease-in-out ${-i * 0.7}s infinite`,
              }}
            />
          ))}

          {/* ===== the 3D stage ===== */}
          <div
            ref={stageRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onWheel={onWheel}
            className="relative mx-auto w-full cursor-grab touch-none select-none overflow-hidden [touch-action:pan-y] active:cursor-grabbing"
            style={{ height: stageH, perspective: compact ? "900px" : "1200px" }}
          >
            {/* glow behind the center card */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bora-500/25 blur-3xl"
              style={{ width: cardW * 1.5, height: cardW * 1.9 }}
            />

            {CARDS.map((c, i) => {
              let raw = i - active;
              if (raw > 3) raw -= N;
              if (raw < -3) raw += N;
              if (Math.abs(raw) > 3) return null;

              const x = raw * spacing + drag;
              const z = -Math.abs(raw) * depth;
              const rot = -raw * angle;
              const scale = 1 - Math.abs(raw) * 0.13;
              const opacity = 1 - Math.abs(raw) * 0.22;
              const isCenter = raw === 0;

              return (
                <div
                  key={c.title}
                  data-card={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: cardW,
                    height: cardW * (4 / 3),
                    zIndex: 20 - Math.abs(raw),
                    transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg) scale(${scale})`,
                    opacity,
                    transition: dragging || reduced
                      ? "none"
                      : "transform 0.6s cubic-bezier(0.22, 1.15, 0.36, 1), opacity 0.5s ease, box-shadow 0.5s ease",
                  }}
                >
                  <div
                    className="gallery-float h-full w-full"
                    style={{ animationDelay: `${i * 0.65}s` }}
                  >
                    <div
                      className={`relative h-full w-full overflow-hidden rounded-2xl border p-1.5 transition-shadow duration-500 ${
                        isCenter
                          ? "border-fuchsia-400/50 shadow-[0_26px_70px_rgba(168,85,247,0.4)]"
                          : "border-white/15 shadow-[0_14px_40px_rgba(10,2,20,0.5)]"
                      }`}
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <CardImage card={c} index={i} total={N} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* auto slide indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.25em] text-fuchsia-300 uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
              auto slide mode · {String(active + 1).padStart(2, "0")} / {N}
            </span>
          </div>

          {/* ===== controls ===== */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                pauseAuto();
                prev();
                scheduleResume();
              }}
              className="glass h-11 rounded-full px-6 text-xs font-bold tracking-widest text-bora-200 transition-all hover:border-fuchsia-400/60 hover:text-white active:scale-95"
            >
              ← PREVIOUS
            </button>

            <div className="flex max-w-[70vw] flex-wrap items-center justify-center gap-1.5 px-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    pauseAuto();
                    playFlip();
                    setActive(i);
                    scheduleResume();
                  }}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active === i ? "w-5 bg-fuchsia-400" : "w-1.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                pauseAuto();
                next();
                scheduleResume();
              }}
              className="glass h-11 rounded-full px-6 text-xs font-bold tracking-widest text-bora-200 transition-all hover:border-fuchsia-400/60 hover:text-white active:scale-95"
            >
              NEXT →
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-bora-200/50">
            auto slide mode is on — drag, swipe or click to take control · photos via Wikimedia Commons (CC BY)
          </p>
        </div>
      </div>
    </section>
  );
}
