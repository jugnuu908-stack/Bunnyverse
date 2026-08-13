import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { projects } from "../data/content";
import { playClick, playFlip, playWin } from "../lib/synth";

interface Planet {
  title: string;
  desc: string;
  prompt: string;
  gradient: string;
  size: number; // planet diameter in px
  hasRing?: boolean; // Saturn-style ring
}

/* Six planets in one centered row under khadiza's star. */
const PLANETS: Planet[] = [
  { ...projects[0], size: 52 },
  { ...projects[1], size: 44 },
  { ...projects[2], size: 60, hasRing: true },
  { ...projects[3], size: 40 },
  { ...projects[4], size: 48 },
  { ...projects[5], size: 36 },
];

const STAR_SPOTS: [number, number][] = [
  [8, 16], [88, 12], [18, 80], [74, 84], [46, 6], [6, 44], [94, 48], [62, 20], [28, 92],
];

export default function Projects() {
  const [selected, setSelected] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const p = PLANETS[selected];

  const select = (i: number) => {
    playFlip();
    setSelected(i);
    setAccepted(false);
  };
  const surprise = () => {
    playClick();
    let n = Math.floor(Math.random() * PLANETS.length);
    if (n === selected) n = (n + 1) % PLANETS.length;
    setSelected(n);
    setAccepted(false);
  };
  const accept = () => {
    playWin();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#a855f7", "#ec4899", "#f0abfc", "#ffffff", "#d8b4fe"],
    });
    setAccepted(true);
  };

  return (
    <section id="moments" className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ============ THE PLANET ROW ============ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative py-10"
        >
          {/* deep space glow */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.14),transparent_70%)]" />

          {/* twinkling stars */}
          {STAR_SPOTS.map(([x, y], i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animation: `twinkle ${2 + (i % 4) * 0.7}s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}

          {/* the sun — khadiza's star, centered above the row */}
          <div className="relative z-10 mx-auto mb-14 w-fit">
            <div className="absolute -inset-8 rounded-full bg-bora-600/25 blur-2xl" />
            <div className="animate-pulse-glow relative mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 via-bora-500 to-purple-800 sm:h-20 sm:w-20">
              <div className="absolute inset-[14%] rounded-full bg-white/20 blur-md" />
              <div className="absolute left-[20%] top-[18%] h-[30%] w-[30%] rounded-full bg-white/50 blur-[6px]" />
            </div>
            <div className="mt-2 whitespace-nowrap text-center text-[9px] font-semibold tracking-[0.3em] text-bora-300 uppercase">
              khadiza's star
            </div>
          </div>

          {/* planets — one centered row */}
          <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4">
            {PLANETS.map((pl, i) => (
              <div
                key={pl.title}
                className="animate-bob shrink-0"
                style={{
                  width: pl.size,
                  height: pl.size,
                  animationDelay: `${i * 0.45}s`,
                }}
              >
                <button
                  onClick={() => select(i)}
                  aria-label={`Planet ${pl.title}`}
                  className="group/planet relative block h-full w-full cursor-pointer"
                >
                  {/* hover label */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-night-900/85 px-2.5 py-0.5 text-[9px] font-semibold text-bora-300 opacity-0 transition-opacity duration-300 group-hover/planet:opacity-100">
                    {pl.title}
                  </span>

                  {/* the orb */}
                  <span
                    className={`block h-full w-full rounded-full bg-gradient-to-br ${pl.gradient} shadow-lg shadow-purple-950/60 transition-transform duration-300 group-hover/planet:scale-110 ${
                      selected === i
                        ? "ring-2 ring-white/90 shadow-[0_0_32px_rgba(216,180,254,0.8)]"
                        : "ring-1 ring-white/20"
                    }`}
                  >
                    <span className="absolute inset-[16%] block rounded-full bg-white/10 blur-[6px]" />
                    <span className="absolute left-[22%] top-[20%] block h-[26%] w-[26%] rounded-full bg-white/40 blur-[4px]" />
                  </span>

                  {/* Saturn-style ring */}
                  {pl.hasRing && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-1/2 h-[45%] w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%] border border-white/40"
                    />
                  )}
                </button>
              </div>
            ))}
          </div>

          <p className="relative z-10 mt-10 text-center text-xs text-bora-200/50">
            click a planet to receive your JK memory mission · the star never dims
          </p>
        </motion.div>

        {/* ============ JK MEMORY MISSION TICKET ============ */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="glass lift relative min-h-[400px] overflow-hidden rounded-3xl p-7 sm:p-9">
            {/* planet-colored nebula in the corner */}
            <div
              className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${p.gradient} opacity-25 blur-3xl transition-all duration-700`}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-bora-300 uppercase">
                    🎟️ JK memory mission
                  </span>
                  <button
                    onClick={surprise}
                    className="glass rounded-full px-4 py-1.5 text-[11px] font-bold text-fuchsia-300 transition-all hover:border-fuchsia-400/60 hover:text-white"
                  >
                    surprise me ✨
                  </button>
                </div>

                {/* the ticket */}
                <div className="relative mt-6 rounded-2xl border border-dashed border-bora-400/30 bg-white/5 p-6 text-center sm:p-8">
                  <div className="font-hand text-4xl leading-tight text-shine sm:text-5xl">{p.title}</div>
                  <p className="mt-4 text-sm leading-relaxed text-bora-200/75 sm:text-base">{p.prompt}</p>
                  {/* ticket notches */}
                  <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-night-900" />
                  <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-night-900" />
                </div>

                {!accepted ? (
                  <button
                    onClick={accept}
                    className="btn-bora mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-white"
                  >
                    accept mission 💜
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center"
                  >
                    <p className="text-sm font-bold text-emerald-300">mission accepted ✓</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-bora-200/60">
                      go enjoy — and come back for the next one 💜
                    </p>
                  </motion.div>
                )}

                <div className="mt-7 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-semibold tracking-widest text-bora-200/40 uppercase">
                    mission {String(selected + 1).padStart(2, "0")} of 06
                  </span>
                  <div className="flex items-center gap-2">
                    {PLANETS.map((pl, i) => (
                      <button
                        key={pl.title}
                        onClick={() => select(i)}
                        aria-label={`Go to planet ${pl.title}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selected === i ? "w-6 bg-fuchsia-400" : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <a
                  href="#arcade"
                  onClick={() => playClick()}
                  className="btn-bora mt-7 block rounded-2xl py-3 text-center text-sm font-bold text-white"
                >
                  next stop: the JK arcade
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
