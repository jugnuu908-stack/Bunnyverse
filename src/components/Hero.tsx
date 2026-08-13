import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroRoles } from "../data/content";
import { playClick } from "../lib/synth";
import { JK_PHOTOS, wm } from "../lib/commons";

/* The hero card is now a living slideshow of all 36 real Jung Kook photos. */
function HeroJKSlideshow() {
  const [idx, setIdx] = useState(0);
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % JK_PHOTOS.length);
    }, 3500); // one photo every 3.5 seconds — auto, endless
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-night-700 to-night-800">
        <AnimatePresence initial={false}>
          <motion.img
            key={idx}
            src={wm(JK_PHOTOS[idx].file, 640)}
            alt={`Jung Kook — ${JK_PHOTOS[idx].title}`}
            loading="lazy"
            draggable={false}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </AnimatePresence>
        {/* soft bottom gradient so the footer text stays readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-night-950/80 to-transparent" />
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="font-hand text-xl text-white">{JK_PHOTOS[idx].title} ✨</span>
        <span className="text-xs tracking-widest text-bora-300">
          {String(idx + 1).padStart(2, "0")} / {JK_PHOTOS.length} 💜
        </span>
      </div>
    </>
  );
}

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length];
    const speed = deleting ? 40 : 85;
    const t = window.setTimeout(() => {
      if (!deleting) {
        const next = word.slice(0, text.length + 1);
        setText(next);
        if (next === word) window.setTimeout(() => setDeleting(true), 1600);
      } else {
        const next = word.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, speed);
    return () => window.clearTimeout(t);
  }, [text, deleting, wordIdx, words]);

  return text;
}

export default function Hero() {
  const typed = useTypewriter(heroRoles);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')", opacity: 0.35 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/50 via-night-950/30 to-night-950/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,2,20,0.3)_100%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left copy */}
        <div className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-bora-400/30 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-bora-300 uppercase backdrop-blur"
          >
            안녕하세요 💜 hello, Bunnyverse
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-6 text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            I'm <span className="text-shine">Khadiza</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex h-8 items-center justify-center text-lg font-medium text-fuchsia-300 lg:justify-start sm:text-xl"
          >
            <span className="mr-2 animate-heartbeat">🐰</span>
            {typed}
            <span className="ml-1 animate-pulse">|</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-bora-200/75 sm:text-base lg:mx-0"
          >
            <span className="block font-semibold text-white">
              If you came here for Jung Kook... you're definitely in the right place. 🐰💜
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <a
              href="#jk-zone"
              onClick={() => playClick()}
              className="btn-bora rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              ENTER MY JK WORLD 💜
            </a>
            <a
              href="#jk-music"
              onClick={() => playClick()}
              className="glass rounded-full px-7 py-3 text-sm font-semibold text-bora-200 transition-all hover:border-fuchsia-400/50 hover:text-white"
            >
              LISTEN TO JUNG KOOK 🎧
            </a>
            <a
              href="#arcade"
              onClick={() => playClick()}
              className="glass rounded-full px-7 py-3 text-sm font-semibold text-bora-200 transition-all hover:border-fuchsia-400/50 hover:text-white"
            >
              PLAY THE ARCADE 🎮
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-10 grid grid-cols-2 gap-3 sm:max-w-lg lg:mx-0 mx-auto sm:grid-cols-4"
          >
            {[
              { e: "🐰", n: "JUNG KOOK", l: "my favorite" },
              { e: "🎧", n: "JK MUSIC", l: "on repeat" },
              { e: "💜", n: "BORAHAE", l: "always" },
              { e: "✨", n: "GOLDEN", l: "era" },
            ].map((s) => (
              <div key={s.n} className="glass rounded-2xl px-2 py-4 text-center">
                <div className="text-xl">{s.e}</div>
                <div className="mt-1 text-xs font-extrabold text-shine">{s.n}</div>
                <div className="mt-0.5 text-[9px] leading-tight tracking-wide text-bora-200/60 uppercase">{s.l}</div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 text-[11px] font-medium tracking-wide text-bora-200/50 lg:text-left text-center"
          >
            💜 a fan-made Jung Kook universe created by Khadiza
          </motion.p>
        </div>

        {/* Right artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 0.8, type: "spring", stiffness: 90 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-6 rounded-full bg-bora-600/25 blur-3xl" />
          <div className="relative animate-float-slow">
            <div className="glass lift overflow-hidden rounded-3xl p-2.5">
              <HeroJKSlideshow />
            </div>

            {/* floating badges */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -top-6 -right-3 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/40 sm:-right-10"
            >
              🐰 GOLDEN Maknae
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass absolute -bottom-5 -left-3 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 sm:-left-8"
            >
              💜 Borahae Forever
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex h-11 w-7 items-start justify-center rounded-full border-2 border-bora-400/50 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-bora-300" />
        </motion.div>
      </motion.a>
    </section>
  );
}
