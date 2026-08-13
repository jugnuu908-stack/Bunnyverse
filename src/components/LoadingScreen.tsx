import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   THE ENTRANCE — a premium screen reveal.
   No devices, no frames. Just the website itself, unfolding
   from a clean purple darkness with floating languages.
   ============================================================ */

const LANGUAGES = [
  { text: "보라해", lang: "korean" },
  { text: "I Purple You", lang: "english" },
  { text: "ボラへ", lang: "japanese" },
  { text: "紫爱你", lang: "chinese" },
  { text: "Je t'aime", lang: "french" },
  { text: "Te quiero", lang: "spanish" },
];

type Phase = "dark" | "langs" | "reveal";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [langIdx, setLangIdx] = useState<number | null>(null);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /* timeline:
     0.0s  clean purple/black
     0.8s  languages, one at a time
     2.8s  languages gone → the website reveals itself
     4.6s  transition complete */
  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(onDone, 700);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("langs"), 800));
    timers.push(window.setTimeout(() => setLangIdx(0), 950));
    timers.push(window.setTimeout(() => setPhase("reveal"), 2800));
    timers.push(window.setTimeout(onDone, 4600));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced, onDone]);

  /* cycle languages */
  useEffect(() => {
    if (langIdx === null || phase !== "langs") return;
    const t = window.setTimeout(() => {
      setLangIdx((i) => (i !== null && i + 1 < LANGUAGES.length ? i + 1 : null));
    }, 330);
    return () => window.clearTimeout(t);
  }, [langIdx, phase]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#05010c]"
      style={{ perspective: "1200px" }}
    >
      {/* deep purple atmosphere */}
      <div
        className="absolute left-1/2 top-1/2 h-[85vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.38), rgba(10,2,20,0) 65%)",
          opacity: phase === "reveal" ? 1.6 : 1,
          transform: phase === "reveal" ? "translate(-50%, -50%) scale(1.7)" : "translate(-50%, -50%) scale(1)",
          transition: "transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s ease",
        }}
      />

      {/* the website, already preloaded — revealed from the center */}
      <motion.div
        className="relative h-full w-full"
        initial={{ opacity: 0, scale: 0.96, rotateX: 4, filter: "blur(12px)" }}
        animate={
          phase === "reveal"
            ? { opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.96, rotateX: 4, filter: "blur(12px)" }
        }
        transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "50% 55%" }}
      >
        <div className="h-full w-full">
          <div className="h-[60vh] w-full bg-gradient-to-b from-[#140725] via-[#1d0b36] to-[#0a0214]" />
        </div>
      </motion.div>

      {/* floating languages in the center */}
      <AnimatePresence>
        {phase === "langs" && langIdx !== null && (
          <motion.div
            key={langIdx}
            initial={{ opacity: 0, scale: 0.94, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(5px)" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
          >
            <span
              className="font-hand leading-none text-white drop-shadow-[0_0_28px_rgba(192,132,252,0.6)]"
              style={{ fontSize: "clamp(2.4rem, 8vw, 4.2rem)" }}
            >
              {LANGUAGES[langIdx].text} 💜
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.45em] text-bora-300/60">
              {LANGUAGES[langIdx].lang}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* final soft bloom when the site is revealed */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: phase === "reveal" ? 1 : 0,
          background: "radial-gradient(circle at 50% 50%, rgba(216,180,254,0.22), rgba(10,2,20,0.4) 80%)",
        }}
      />
    </motion.div>
  );
}
