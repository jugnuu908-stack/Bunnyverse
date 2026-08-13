import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { quizQuestions, quizRank, popRank } from "../data/content";
import { playFlip, playMatch, playWrong, playPop, playBomb, playWin, playClick } from "../lib/synth";
import { SectionTitle } from "./effects";

function purpleConfetti() {
  confetti({
    particleCount: 130,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#a855f7", "#ec4899", "#f0abfc", "#ffffff", "#d8b4fe"],
  });
}

/* ---------------- MEMORY GAME ---------------- */

const PAIRS = [
  { emoji: "🐰", label: "Cooky" },
  { emoji: "🎤", label: "Mic" },
  { emoji: "🎧", label: "Studio" },
  { emoji: "✨", label: "GOLDEN" },
  { emoji: "💜", label: "Borahae" },
  { emoji: "🌟", label: "Star" },
  { emoji: "🎨", label: "Artist" },
  { emoji: "🎮", label: "Gamer" },
];

interface Card {
  id: number;
  pair: number;
}

function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(() =>
    [...Array(16)].map((_, i) => ({ id: i, pair: i % 8 })).sort(() => Math.random() - 0.5)
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (won) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [won]);

  const flip = (idx: number) => {
    if (lockRef.current || flipped.includes(idx) || matched.has(cards[idx].pair) || won) return;
    playFlip();
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      lockRef.current = true;
      window.setTimeout(() => {
        if (cards[a].pair === cards[b].pair) {
          const nm = new Set(matched);
          nm.add(cards[a].pair);
          setMatched(nm);
          playMatch();
          if (nm.size === PAIRS.length) {
            setWon(true);
            playWin();
            purpleConfetti();
          }
        } else {
          playWrong();
        }
        setFlipped([]);
        lockRef.current = false;
      }, 650);
    }
  };

  const reset = () => {
    playClick();
    setCards([...Array(16)].map((_, i) => ({ id: i, pair: i % 8 })).sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setWon(false);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Stat label="moves" value={moves} />
          <Stat label="time" value={`${seconds}s`} />
          <Stat label="matched" value={`${matched.size}/8`} />
        </div>
        <button onClick={reset} className="glass rounded-full px-5 py-2 text-xs font-semibold text-bora-200 hover:text-white">
          ↺ new game
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((c, i) => {
          const isUp = flipped.includes(i) || matched.has(c.pair);
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              className="flip-scene relative aspect-square"
              aria-label={`Card ${i + 1}`}
            >
              <div className={`flip-inner h-full w-full ${isUp ? "flipped" : ""}`}>
                <div className="flip-face flex items-center justify-center rounded-2xl border border-bora-400/25 bg-gradient-to-br from-night-700 to-night-800 text-2xl text-bora-500 transition-colors hover:border-fuchsia-400/50">
                  <span className="animate-heartbeat text-xl">💜</span>
                </div>
                <div
                  className={`flip-face flip-back-face flex flex-col items-center justify-center rounded-2xl border p-1 ${
                    matched.has(c.pair)
                      ? "border-fuchsia-400/70 bg-gradient-to-br from-bora-600/50 to-fuchsia-600/40 shadow-[0_0_24px_rgba(236,72,153,0.35)]"
                      : "border-bora-300/30 bg-gradient-to-br from-bora-600/30 to-night-700"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{PAIRS[c.pair].emoji}</span>
                  <span className="mt-1 text-[8px] font-bold tracking-wide text-white sm:text-[9px]">
                    {PAIRS[c.pair].label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass mt-6 rounded-3xl border-fuchsia-400/40 p-6 text-center"
          >
            <div className="text-4xl">🏆✨</div>
            <h4 className="mt-2 text-xl font-bold text-white">JK MEMORY UNLOCKED!</h4>
            <p className="mt-1 text-sm text-bora-200/70">
              You matched the full JK world in {moves} moves and {seconds}s. Golden brain — Cooky
              approves. 🐰
            </p>
            <button onClick={reset} className="btn-bora mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-white">
              play again ↺
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- HEART POP GAME ---------------- */

type Phase = "idle" | "playing" | "done";
type ItemType = "star" | "gold" | "bomb";

function HeartPopGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState<{ hole: number; type: ItemType; id: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const lastHit = useRef(0);
  const idRef = useRef(0);

  const stopAll = () => {
    setPhase("idle");
    setActive(null);
  };

  const start = () => {
    playClick();
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(30);
    lastHit.current = 0;
    setPhase("playing");
  };

  // spawner
  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = window.setInterval(() => {
      const hole = Math.floor(Math.random() * 9);
      const r = Math.random();
      const type: ItemType = r < 0.74 ? "star" : r < 0.9 ? "gold" : "bomb";
      const id = idRef.current++;
      setActive({ hole, type, id });
      window.setTimeout(() => {
        setActive((cur) => (cur && cur.id === id ? null : cur));
      }, 760);
    }, 640);
    return () => window.clearInterval(spawn);
  }, [phase]);

  // countdown
  useEffect(() => {
    if (phase !== "playing") return;
    const t = window.setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0) setPhase("done");
  }, [timeLeft, phase]);

  const pop = (hole: number) => {
    if (phase !== "playing" || !active || active.hole !== hole) return;
    const now = performance.now();
    if (active.type === "bomb") {
      playBomb();
      setScore((s) => Math.max(0, s - 20));
      setCombo(0);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } else {
      const isChain = now - lastHit.current < 2500;
      const newCombo = isChain ? combo + 1 : 1;
      lastHit.current = now;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      playPop(newCombo);
      setScore((s) => s + (active.type === "gold" ? 30 : 10) * Math.min(newCombo, 5));
    }
    setActive(null);
  };

  const rank = popRank(score);

  return (
    <div>
      {phase === "idle" && (
        <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
          <div className="animate-heartbeat text-6xl">✨</div>
          <h4 className="mt-3 text-xl font-bold text-white">GOLDEN STAR CATCH</h4>
          <p className="mt-2 text-sm text-bora-200/70">
            30 seconds. Catch ✨ stars (+10), grab ⭐ golden stars (+30), and{" "}
            <span className="font-semibold text-rose-400">never touch 💣 bombs (−20)</span>. Chain catches to
            build your combo multiplier — GOLDEN era reflexes required.
          </p>
          <button onClick={start} className="btn-bora mt-6 rounded-full px-8 py-3 text-sm font-bold text-white">
            start popping ▶
          </button>
        </div>
      )}

      {phase !== "idle" && (
        <div className={`mx-auto max-w-md ${shake ? "shake" : ""}`}>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 px-5 py-3">
            <div className="text-sm font-bold text-white">
              score: <span className="text-shine">{score}</span>
            </div>
            <div className="text-sm font-bold text-fuchsia-300">
              combo <span className="text-white">x{Math.min(combo, 5)}</span>{" "}
              {combo >= 2 && <span className="animate-pop-in inline-block">🔥</span>}
            </div>
            <div className={`text-sm font-bold ${timeLeft <= 5 ? "animate-pulse text-rose-400" : "text-white"}`}>
              ⏱ {timeLeft}s
            </div>
          </div>

          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-bora-500 to-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-3xl p-4 sm:p-6">
            {Array.from({ length: 9 }, (_, hole) => (
              <button
                key={hole}
                onClick={() => pop(hole)}
                className="relative aspect-square rounded-2xl border border-bora-400/20 bg-night-800 transition-colors hover:border-bora-400/50"
                aria-label={`Hole ${hole + 1}`}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {active?.hole === hole && (
                      <motion.span
                        key={active.id}
                        initial={{ scale: 0.3, y: -8, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        className="text-4xl sm:text-5xl"
                      >
                        {active.type === "star" ? "✨" : active.type === "gold" ? "⭐" : "💣"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mx-auto mt-6 max-w-md rounded-3xl border-fuchsia-400/40 p-8 text-center"
          >
            <div className="text-5xl">{rank.title.split(" ").pop()}</div>
            <h4 className="mt-2 text-xl font-bold text-white">{rank.title}</h4>
            <p className="mt-2 text-sm text-bora-200/70">{rank.msg}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-lg font-bold text-white">{score}</div>
                <div className="text-[10px] uppercase tracking-wide text-bora-200/60">score</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-lg font-bold text-white">x{Math.min(bestCombo, 5)}</div>
                <div className="text-[10px] uppercase tracking-wide text-bora-200/60">best combo</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-lg font-bold text-white">💜</div>
                <div className="text-[10px] uppercase tracking-wide text-bora-200/60">borahae</div>
              </div>
            </div>
            <button onClick={start} className="btn-bora mt-6 rounded-full px-8 py-3 text-sm font-bold text-white">
              one more round ↺
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "playing" && score > 0 && bestCombo >= 3 && (
        <p className="mt-3 text-center text-xs text-fuchsia-300">best combo x{Math.min(bestCombo, 5)} — golden maknae reflexes! ✨</p>
      )}

      {phase !== "idle" && (
        <button onClick={stopAll} className="mx-auto mt-4 block text-xs text-bora-200/50 hover:text-white">
          ✕ quit game
        </button>
      )}
    </div>
  );
}

/* ---------------- BTS QUIZ ---------------- */

function BTSQuiz() {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = quizQuestions[qIdx];

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setScore((s) => s + 1);
      playMatch();
    } else {
      playWrong();
    }
    window.setTimeout(() => {
      if (qIdx + 1 >= quizQuestions.length) {
        setDone(true);
        playWin();
        purpleConfetti();
      } else {
        setQIdx((x) => x + 1);
        setPicked(null);
      }
    }, 1100);
  };

  const restart = () => {
    playClick();
    setQIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  if (done) {
    const rank = quizRank(score, quizQuestions.length);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass mx-auto max-w-md rounded-3xl border-fuchsia-400/40 p-8 text-center">
        <div className="animate-heartbeat text-6xl">🎤</div>
        <p className="mt-2 text-[10px] font-bold tracking-[0.35em] text-bora-300 uppercase">JK Score</p>
        <h4 className="mt-1 text-2xl font-bold text-white">{rank.title}</h4>
        <p className="mt-2 text-sm text-bora-200/70">{rank.msg}</p>
        <div className="mt-5 inline-block rounded-full bg-bora-500/15 px-6 py-2 text-lg font-bold text-fuchsia-300">
          {score} / {quizQuestions.length} 💜
        </div>
        <div className="mt-6">
          <button onClick={restart} className="btn-bora rounded-full px-8 py-3 text-sm font-bold text-white">
            retake quiz ↺
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h4 className="mb-1 text-center text-xl font-bold text-white sm:text-2xl">
        OK KHADIZA... <span className="text-shine">YOUR TURN.</span>
      </h4>
      <p className="mb-4 text-center text-xs text-bora-200/60">
        7 questions. Zero mercy. Show what you know about Jung Kook.
      </p>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-bora-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${((qIdx + (picked !== null ? 1 : 0)) / quizQuestions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-bora-300">
          {qIdx + 1}/{quizQuestions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-3xl p-7"
        >
          <h4 className="text-lg font-bold text-white sm:text-xl">{q.q}</h4>
          <div className="mt-5 grid gap-3">
            {q.options.map((opt, i) => {
              let style = "border-bora-400/20 bg-white/5 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10";
              if (picked !== null) {
                if (i === q.answer) style = "border-emerald-400/70 bg-emerald-500/20 text-white";
                else if (i === picked) style = "border-rose-500/70 bg-rose-500/20 text-rose-200";
                else style = "border-white/5 bg-white/5 opacity-50";
              }
              return (
                <button
                  key={opt}
                  onClick={() => answer(i)}
                  className={`rounded-2xl border px-5 py-3.5 text-left text-sm font-medium transition-all ${style}`}
                >
                  <span className="mr-3 font-hand text-lg text-fuchsia-300">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {picked !== null && i === q.answer && <span className="float-right">✅</span>}
                  {picked !== null && i === picked && i !== q.answer && <span className="float-right">❌</span>}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-center text-xs text-bora-200/50">score so far: {score} 💜 · wrong answers just mean it's time for another listen 🎧</p>
    </div>
  );
}

/* ---------------- GAME HUB ---------------- */

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-2 text-center">
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-bora-200/60">{label}</div>
    </div>
  );
}

const TABS = [
  { id: "memory", label: "JK Memory Match", emoji: "🐰" },
  { id: "pop", label: "Golden Star Catch", emoji: "⭐" },
  { id: "quiz", label: "JK Song Quiz", emoji: "🎤" },
] as const;

export default function Games() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("memory");
  const [round, setRound] = useState(0);

  return (
    <section id="arcade" className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <SectionTitle eyebrow="play with me" title="The JK Arcade 🎮" />

      <div className="mb-8 flex justify-center">
        <div className="glass inline-flex rounded-full p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playClick();
                setTab(t.id);
                setRound((r) => r + 1);
              }}
              className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-all sm:px-6 sm:text-sm ${
                tab === t.id
                  ? "bg-gradient-to-r from-bora-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/40"
                  : "text-bora-200/70 hover:text-white"
              }`}
            >
              <span className="mr-1.5">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + round}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35 }}
        >
          {tab === "memory" && <MemoryGame />}
          {tab === "pop" && <HeartPopGame />}
          {tab === "quiz" && <BTSQuiz />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
