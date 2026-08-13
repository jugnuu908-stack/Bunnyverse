import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { JK_PHOTOS, wm } from "../lib/commons";

/* Ambient hearts drifting up the screen */
export function FloatingHearts({ count = 14 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 12 + Math.random() * 22,
        duration: 9 + Math.random() * 14,
        delay: Math.random() * 16,
        opacity: 0.12 + Math.random() * 0.3,
        emoji: Math.random() > 0.2 ? "💜" : "✨",
      })),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute animate-heart-fall will-change-transform"
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            animationIterationCount: "infinite",
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

/* Sparkle heart trail following the cursor */
export function HeartCursor() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rot: number; emoji: string }[]>([]);
  const lastSpawn = useRef(0);
  const idRef = useRef(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < 70) return;
      lastSpawn.current = now;
      const p = {
        id: idRef.current++,
        x: e.clientX,
        y: e.clientY,
        rot: Math.random() * 40 - 20,
        emoji: Math.random() > 0.55 ? "💜" : "✨",
      };
      setParticles((prev) => [...prev.slice(-14), p]);
      window.setTimeout(() => {
        setParticles((prev) => prev.filter((q) => q.id !== p.id));
      }, 950);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-sm"
          style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
        >
          <motion.span
            className="inline-block"
            style={{ rotate: p.rot }}
            initial={{ opacity: 0.9, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.4, y: -34 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {p.emoji}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/* Full-screen emoji rain — hearts, bunnies & sparkles */
const SHOWER_EMOJIS = ["💜", "🐰", "🐇", "✨", "⭐", "💫", "🌙", "🌸", "🎀", "💕", "🩷", "🥰", "🎵"];
const PURPLE_EMOJIS = ["💜", "💜", "🐰", "💜"];

export function HeartRain({
  trigger,
  onDone,
  variant = "secret",
}: {
  trigger: number;
  onDone: () => void;
  variant?: "secret" | "shower" | "purple";
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setActive(true);
    const t = window.setTimeout(() => {
      setActive(false);
      onDone();
    }, 5200);
    return () => window.clearTimeout(t);
  }, [trigger, onDone]);

  if (!active) return null;

  const drops = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 16 + Math.random() * 32,
    duration: 2.2 + Math.random() * 2.6,
    delay: Math.random() * 1.4,
    emoji:
      variant === "shower"
        ? SHOWER_EMOJIS[Math.floor(Math.random() * SHOWER_EMOJIS.length)]
        : variant === "purple"
          ? PURPLE_EMOJIS[Math.floor(Math.random() * PURPLE_EMOJIS.length)]
          : "💜",
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-600/20 via-purple-800/30 to-pink-600/20" />
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute animate-heart-fall"
          style={{
            left: `${d.left}%`,
            fontSize: d.size,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        >
          {d.emoji}
        </span>
      ))}
      {variant === "secret" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 16 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-5"
        >
          <img
            src={wm(JK_PHOTOS[35].file, 640)}
            alt="Jung Kook — Rose Bowl Euphoria"
            className="h-36 w-36 animate-bob rounded-3xl object-cover object-top shadow-[0_0_60px_rgba(236,72,153,0.7)] ring-4 ring-fuchsia-400/70 sm:h-44 sm:w-44"
          />
          <span className="mt-6 text-center font-hand text-5xl text-bora-200 drop-shadow-[0_0_30px_rgba(236,72,153,0.9)] sm:text-7xl">
            You found the GOLDEN Secret ✨
          </span>
          <span className="mt-3 rounded-full border border-amber-400/40 bg-night-900/60 px-5 py-2 text-sm tracking-widest text-amber-200">
            "Okay, Khadiza... you really explored everything." 🐰
          </span>
          <a
            href="#jk-music"
            className="mt-5 rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-600 px-6 py-2.5 text-xs font-bold tracking-widest text-white shadow-lg shadow-fuchsia-900/40 transition-transform hover:scale-105"
          >
            🎧 NOW PLAY: THE JK PLAYLIST →
          </a>
        </motion.div>
      ) : variant === "shower" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 16 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-5"
        >
          <span className="text-center font-hand text-5xl text-bora-200 drop-shadow-[0_0_30px_rgba(236,72,153,0.9)] sm:text-7xl">
            Borahae!! 💜🐰
          </span>
          <span className="mt-3 rounded-full border border-bora-400/40 bg-night-900/60 px-5 py-2 text-sm tracking-widest text-bora-300">
            hearts, bunnies & sparkles — just for you ✨
          </span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 16 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-5"
        >
          <span className="text-center font-hand text-5xl text-bora-200 drop-shadow-[0_0_30px_rgba(236,72,153,0.9)] sm:text-7xl">
            Borahae! 💜🐰
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* Reusable section heading */
export function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-12 max-w-2xl text-center"
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-bora-500/30 bg-bora-500/10 px-4 py-1.5 text-xs font-medium tracking-[0.25em] text-bora-300 uppercase">
          <span className="animate-wiggle inline-block">💜</span> {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
        {title} <span className="text-shine">.</span>
      </h2>
      {sub && <p className="mt-3 text-sm leading-relaxed text-bora-200/70 sm:text-base">{sub}</p>}
    </motion.div>
  );
}
