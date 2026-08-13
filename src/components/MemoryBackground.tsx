import { useEffect, useMemo, useRef, useState } from "react";
import { JK_PHOTOS, BACKDROP_FILE, wm } from "../lib/commons";

/* ============================================================
   THE JUNG KOOK MEMORY UNIVERSE — immersive floating background.
   - A Jung Kook stage photo (Wikimedia Commons, CC-licensed) is
     the site-wide backdrop, dimmed behind every section.
   - Every floating memory card is a real Jung Kook photo.
   ============================================================ */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Memory {
  id: number;
  src: string;
  x: number; // %
  y: number; // vh
  w: number; // px
  rot: number; // deg
  opacity: number;
  blur: number;
  dur: number;
  delay: number;
  glow: boolean;
}

function buildMemories(compact: boolean) {
  const rnd = mulberry32(20240901);
  const count = compact ? 18 : 44;
  const back: Memory[] = [];
  const mid: Memory[] = [];
  const front: Memory[] = [];
  for (let i = 0; i < count; i++) {
    const roll = rnd();
    const layer = roll < 0.4 ? "back" : roll < 0.85 ? "mid" : "front";
    const photo = JK_PHOTOS[i % JK_PHOTOS.length];
    const mem: Memory = {
      id: i,
      src: wm(photo.file, 420),
      x: 2 + rnd() * 94,
      y: layer === "back" ? rnd() * 90 : layer === "mid" ? rnd() * 120 : rnd() * 150,
      w: layer === "back" ? 46 + rnd() * 40 : layer === "mid" ? 62 + rnd() * 60 : 105 + rnd() * 80,
      rot: -12 + rnd() * 24,
      opacity:
        layer === "back" ? 0.1 + rnd() * 0.16 : layer === "mid" ? 0.3 + rnd() * 0.32 : 0.78 + rnd() * 0.22,
      blur: layer === "back" ? (rnd() > 0.5 ? 2.5 : 0.5) : layer === "mid" ? (rnd() > 0.72 ? 1.5 : 0) : 0,
      dur: 13 + rnd() * 16,
      delay: -rnd() * 22,
      glow: layer === "front" && rnd() > 0.6,
    };
    if (compact) mem.w *= 0.7;
    if (layer === "back") back.push(mem);
    else if (layer === "mid") mid.push(mem);
    else front.push(mem);
  }
  return { back, mid, front };
}

/* A polaroid-style memory card. If the image file doesn't exist yet,
   a soft placeholder (with a faint bunny) remains in its place. */
function MemoryCard({ m }: { m: Memory }) {
  return (
    <div
      className="memory-anim absolute"
      style={{
        left: `${m.x}%`,
        top: `${m.y}vh`,
        width: m.w,
        animationDuration: `${m.dur}s`,
        animationDelay: `${m.delay}s`,
      }}
    >
      <div
        className="relative rounded-xl p-1.5"
        style={{
          transform: `rotate(${m.rot}deg)`,
          opacity: m.opacity,
          background: "rgba(255,255,255,0.07)",
          boxShadow: m.glow
            ? "0 10px 40px rgba(216,180,254,0.28), 0 4px 14px rgba(10,2,20,0.5)"
            : "0 6px 20px rgba(10,2,20,0.45)",
        }}
      >
        {/* placeholder (visible until a real photo is added) */}
        <div className="absolute inset-1.5 rounded-lg bg-gradient-to-br from-night-700/80 to-night-800/80" />
        <div className="absolute inset-1.5 flex items-center justify-center rounded-lg text-2xl opacity-[0.12]">
          🐰
        </div>
        <img
          src={m.src}
          alt=""
          loading="lazy"
          draggable={false}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className="relative block rounded-lg"
          style={{
            width: "100%",
            aspectRatio: "1 / 1.25",
            objectFit: "cover",
            filter: m.blur ? `blur(${m.blur}px)` : undefined,
          }}
        />
      </div>
    </div>
  );
}

function Stars({ compact }: { compact: boolean }) {
  const stars = useMemo(() => {
    const rnd = mulberry32(77);
    const n = compact ? 30 : 70;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 110,
      s: 1 + rnd() * 2,
      d: 2 + rnd() * 4,
      delay: -rnd() * 5,
    }));
  }, [compact]);
  return (
    <>
      {stars.map((st) => (
        <span
          key={st.id}
          className="mem-static absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top: `${st.y}vh`,
            width: st.s,
            height: st.s,
            opacity: 0.5,
            animation: `twinkle ${st.d}s ease-in-out ${st.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Floaters({ compact }: { compact: boolean }) {
  const items = useMemo(() => {
    const rnd = mulberry32(5);
    const glyphs = ["💜", "💜", "💜", "🐰", "✨", "♫"];
    const n = compact ? 10 : 20;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      glyph: glyphs[Math.floor(rnd() * glyphs.length)],
      x: rnd() * 96,
      y: rnd() * 120,
      s: 12 + rnd() * 18,
      o: 0.08 + rnd() * 0.14,
      d: 12 + rnd() * 14,
      delay: -rnd() * 20,
    }));
  }, [compact]);
  return (
    <>
      {items.map((f) => (
        <span
          key={f.id}
          className="memory-anim absolute"
          style={{
            left: `${f.x}%`,
            top: `${f.y}vh`,
            fontSize: f.s,
            opacity: f.o,
            animationDuration: `${f.d}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.glyph}
        </span>
      ))}
    </>
  );
}

function Vinyl({ x, y, size, opacity, duration }: { x: string; y: string; size: number; opacity: number; duration: number }) {
  return (
    <div
      className="mem-static absolute"
      style={{ left: x, top: y, width: size, height: size, opacity, animation: `orbitSpin ${duration}s linear infinite` }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.08), transparent 45%), repeating-radial-gradient(circle at center, #171030 0px, #171030 2px, #0d0720 3px, #0d0720 5px)",
        }}
      >
        <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-amber-400/60 to-fuchsia-500/60" />
        <div className="absolute inset-[46%] rounded-full bg-night-950" />
      </div>
    </div>
  );
}

export default function MemoryBackground() {
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const [moods, setMoods] = useState({ music: false, golden: false, night: false });

  const compact = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
    []
  );
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const memories = useMemo(() => buildMemories(compact), [compact]);

  /* ---- section moods: music notes · golden glow · deep moonlight ---- */
  useEffect(() => {
    const musicEl = document.getElementById("jk-music");
    const goldenEl = document.getElementById("golden");
    const footerEl = document.querySelector("footer");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const el = en.target as HTMLElement;
          if (el.id === "jk-music") setMoods((m) => ({ ...m, music: en.isIntersecting }));
          if (el.id === "golden") setMoods((m) => ({ ...m, golden: en.isIntersecting }));
          if (el === footerEl) setMoods((m) => ({ ...m, night: en.isIntersecting }));
        });
      },
      { rootMargin: "-8% 0px -8% 0px" }
    );
    if (musicEl) io.observe(musicEl);
    if (goldenEl) io.observe(goldenEl);
    if (footerEl) io.observe(footerEl);
    return () => io.disconnect();
  }, []);

  /* ---- smooth scroll parallax (3 layers) + subtle mouse parallax ---- */
  useEffect(() => {
    if (reduced) return;
    const back = backRef.current;
    const mid = midRef.current;
    const front = frontRef.current;
    if (!back || !mid || !front) return;

    let target = window.scrollY;
    let cur = target;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const onScroll = () => {
      target = window.scrollY;
    };
    const onMove = (e: MouseEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      cur += (target - cur) * 0.07;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      back.style.transform = `translate3d(${mx * 4}px, ${-cur * 0.045 + my * 5}px, 0)`;
      mid.style.transform = `translate3d(${mx * 7}px, ${-cur * 0.1 + my * 8}px, 0)`;
      front.style.transform = `translate3d(${mx * 12}px, ${-cur * 0.17 + my * 14}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (fine) window.removeEventListener("mousemove", onMove);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* ============ JUNG KOOK BACKDROP — clearly visible behind every section ============ */}
      <div className="absolute inset-0">
        <img
          src={wm(BACKDROP_FILE, 1600)}
          alt=""
          loading="eager"
          draggable={false}
          className="h-full w-full object-cover object-center"
          style={{ opacity: 0.45, filter: "saturate(1.15)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/45 via-night-950/25 to-night-950/55" />
      </div>

      {/* ============ BACK LAYER — stars, nebula, mist, faint memories ============ */}
      <div ref={backRef} className="absolute left-0 top-0 w-full will-change-transform" style={{ height: "110vh" }}>
        {/* nebula glows */}
        <div className="absolute -left-32 top-[-10%] h-[60vh] w-[60vw] rounded-full bg-bora-600/20 blur-[90px]" />
        <div className="absolute right-[-20%] top-[30%] h-[70vh] w-[55vw] rounded-full bg-fuchsia-600/15 blur-[100px]" />
        <div className="absolute left-[20%] top-[55%] h-[50vh] w-[45vw] rounded-full bg-indigo-600/15 blur-[110px]" />

        {/* drifting mist */}
        <div
          className="mem-static absolute left-[8%] top-[20%] h-[36vh] w-[44vw] rounded-full bg-bora-400/10 blur-[60px]"
          style={{ animation: "mistDrift 26s ease-in-out infinite alternate" }}
        />
        <div
          className="mem-static absolute right-[5%] top-[48%] h-[30vh] w-[38vw] rounded-full bg-pink-400/10 blur-[70px]"
          style={{ animation: "mistDrift 32s ease-in-out -8s infinite alternate" }}
        />

        <Stars compact={compact} />

        {/* gentle bokeh */}
        {[12, 30, 55, 74, 88].map((x, i) => (
          <span
            key={i}
            className="mem-static absolute h-3 w-3 rounded-full bg-fuchsia-200/25 blur-[6px]"
            style={{
              left: `${x}%`,
              top: `${20 + i * 14}vh`,
              animation: `twinkle ${4 + i}s ease-in-out ${-i}s infinite`,
            }}
          />
        ))}

        {memories.back.map((m) => (
          <MemoryCard key={`b${m.id}`} m={m} />
        ))}
      </div>

      {/* ============ MIDDLE LAYER — photo cards + floating hearts/bunnies/notes ============ */}
      <div ref={midRef} className="absolute left-0 top-0 w-full will-change-transform" style={{ height: "130vh" }}>
        <Floaters compact={compact} />
        <Vinyl x="82%" y="40vh" size={compact ? 70 : 100} opacity={0.16} duration={60} />
        <Vinyl x="10%" y="85vh" size={compact ? 60 : 84} opacity={0.13} duration={80} />
        {memories.mid.map((m) => (
          <MemoryCard key={`m${m.id}`} m={m} />
        ))}
      </div>

      {/* ============ FRONT LAYER — a few larger, more visible cards ============ */}
      <div ref={frontRef} className="absolute left-0 top-0 w-full will-change-transform" style={{ height: "160vh" }}>
        {memories.front.map((m) => (
          <MemoryCard key={`f${m.id}`} m={m} />
        ))}
      </div>

      {/* ============ MOOD: music — floating notes + vinyl shapes ============ */}
      <div
        className={`absolute inset-0 transition-opacity duration-[1500ms] ${moods.music ? "opacity-100" : "opacity-0"}`}
      >
        {[
          { g: "♪", x: "8%", y: "22%", s: 26, d: 9 },
          { g: "♫", x: "90%", y: "30%", s: 22, d: 11 },
          { g: "♩", x: "15%", y: "68%", s: 20, d: 10 },
          { g: "♬", x: "85%", y: "72%", s: 24, d: 12 },
          { g: "♪", x: "48%", y: "12%", s: 18, d: 8 },
          { g: "♫", x: "60%", y: "84%", s: 21, d: 13 },
          { g: "♪", x: "32%", y: "44%", s: 16, d: 9 },
          { g: "♩", x: "72%", y: "52%", s: 18, d: 10 },
        ].map((n, i) => (
          <span
            key={i}
            className="mem-static absolute font-semibold text-bora-200"
            style={{
              left: n.x,
              top: n.y,
              fontSize: n.s,
              animation: `noteFloat ${n.d}s ease-in-out ${-i * 1.3}s infinite`,
            }}
          >
            {n.g}
          </span>
        ))}
        <Vinyl x="76%" y="34%" size={110} opacity={0.3} duration={40} />
        <Vinyl x="8%" y="58%" size={88} opacity={0.26} duration={52} />
      </div>

      {/* ============ MOOD: golden — warm glow over the GOLDEN section ============ */}
      <div
        className={`absolute inset-0 transition-opacity duration-[1500ms] ${moods.golden ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute -top-24 right-[6%] h-[45vh] w-[45vw] rounded-full bg-amber-400/15 blur-[90px]" />
        <div className="absolute top-[35%] left-[4%] h-[38vh] w-[38vw] rounded-full bg-yellow-300/10 blur-[100px]" />
        {[
          { x: "18%", y: "18%", d: 3 },
          { x: "80%", y: "26%", d: 4 },
          { x: "30%", y: "70%", d: 3.5 },
          { x: "88%", y: "64%", d: 5 },
          { x: "55%", y: "40%", d: 4.5 },
        ].map((s, i) => (
          <span
            key={i}
            className="mem-static absolute text-amber-200"
            style={{
              left: s.x,
              top: s.y,
              fontSize: 14,
              animation: `twinkle ${s.d}s ease-in-out ${-i * 0.8}s infinite`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* ============ MOOD: bottom — deep purple moonlight ============ */}
      <div
        className={`absolute inset-0 transition-opacity duration-[1500ms] ${moods.night ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0420]/70 to-[#060210]/90" />
        {/* crescent moon */}
        <div className="absolute right-[10%] top-[14%] h-24 w-24 opacity-80">
          <div className="h-full w-full rounded-full bg-fuchsia-100/70 blur-[2px]" />
          <div className="absolute -left-4 -top-2 h-24 w-24 rounded-full bg-[#0b0319]" />
        </div>
        <div className="absolute left-[14%] top-[68%] h-16 w-16 opacity-60">
          <div className="h-full w-full rounded-full bg-bora-200/40 blur-[2px]" />
          <div className="absolute -left-3 -top-1.5 h-16 w-16 rounded-full bg-[#0b0319]" />
        </div>
      </div>

      {/* ============ readability overlay — kept light so the backdrop stays visible ============ */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/25 via-night-950/10 to-night-950/40" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(10,2,20,0.3) 100%)" }}
      />
    </div>
  );
}

/* ============================================================
   LAYER 5 — very subtle foreground dust.
   Rendered above the content (z-15, pointer-events-none), moves
   slightly faster than the page so the content feels like it sits
   between the background layers and the viewer.
   ============================================================ */
export function ForegroundDust() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const specks = useMemo(() => {
    const rnd = mulberry32(31337);
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      s: 2 + rnd() * 3,
      o: 0.08 + rnd() * 0.14,
      d: 14 + rnd() * 12,
      delay: -rnd() * 20,
      glow: rnd() > 0.7,
    }));
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let target = window.scrollY;
    let cur = target;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const onScroll = () => {
      target = window.scrollY;
    };
    const onMove = (e: MouseEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      cur += (target - cur) * 0.07;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      el.style.transform = `translate3d(${mx * 22}px, ${-cur * 0.24 + my * 26}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (fine) window.removeEventListener("mousemove", onMove);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
      <div ref={ref} className="absolute left-0 top-0 h-[120vh] w-full will-change-transform">
        {specks.map((s) => (
          <span
            key={s.id}
            className="memory-anim absolute rounded-full bg-fuchsia-100"
            style={{
              left: `${s.x}%`,
              top: `${s.y}vh`,
              width: s.s,
              height: s.s,
              opacity: s.o,
              filter: s.glow ? "blur(1px)" : undefined,
              animationDuration: `${s.d}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
