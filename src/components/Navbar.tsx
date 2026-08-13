import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick } from "../lib/synth";

const LINKS = [
  { label: "My Story", href: "#about" },
  { label: "JK Music", href: "#jk-music" },
  { label: "JK Moments", href: "#moments" },
  { label: "Arcade", href: "#arcade" },
];

export function BTSLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M22 8 L46 26 L46 74 L22 92 Z" fill="url(#g1)" />
      <path d="M78 8 L54 26 L54 74 L78 92 Z" fill="url(#g1)" />
      <path d="M14 100 L14 94 L86 94 L86 100 Z" fill="url(#g2)" />
      <path d="M10 94 L10 90 L90 90 L90 94 Z" fill="url(#g2)" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar({ onEgg, onShower }: { onEgg: () => void; onShower: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const clicks = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = () => {
    playClick();
    onShower(); // every tap = a shower of purple hearts & bunnies
    clicks.current += 1;
    if (clicks.current >= 7) {
      clicks.current = 0;
      onEgg();
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-lg shadow-purple-950/50" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <button onClick={handleLogoClick} className="group flex items-center gap-2.5" aria-label="Home">
          <BTSLogo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-12" />
          <span className="font-hand text-3xl font-bold text-white sm:text-4xl">Khadiza</span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => playClick()}
              className="rounded-full px-4 py-2 text-sm font-medium text-bora-200/80 transition-all hover:bg-bora-500/15 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#arcade"
            onClick={() => playClick()}
            className="btn-bora ml-2 rounded-full px-5 py-2 text-sm font-semibold text-white"
          >
            Play Arcade 🎮
          </a>
        </div>

        <button
          className="glass flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-bora-400/30 bg-night-900/70 shadow-lg shadow-purple-950/40 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <span className={`h-0.5 w-6 rounded bg-white transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-white transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-white transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-bora-400/20 bg-night-900 shadow-xl shadow-purple-950/50 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-5 pt-2">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => {
                    playClick();
                    setOpen(false);
                  }}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-bora-200 hover:bg-bora-500/15 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
