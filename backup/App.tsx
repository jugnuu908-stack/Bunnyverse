import { useCallback, useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import JKZone from "./components/JKZone";
import Games from "./components/Games";
import { FloatingHearts, HeartCursor, HeartRain } from "./components/effects";
import MemoryBackground from "./components/MemoryBackground";
import { playHeartRain } from "./lib/synth";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState(0);
  const [shower, setShower] = useState(0);
  const keyBuffer = useRef("");

  // hidden easter egg → the GOLDEN Secret
  const triggerSecret = useCallback(() => {
    setSecret((r) => r + 1);
    playHeartRain();
  }, []);

  // tap "I Purple You" → borahae emoji shower
  const triggerShower = useCallback(() => {
    setShower((r) => r + 1);
    playHeartRain();
  }, []);

  // type "borahae" anywhere to trigger the easter egg
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      keyBuffer.current = (keyBuffer.current + e.key.toLowerCase()).slice(-7);
      if (keyBuffer.current === "borahae") {
        keyBuffer.current = "";
        triggerSecret();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerSecret]);

  return (
    <div className="relative min-h-screen bg-night-950 font-sans text-white antialiased">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      <MemoryBackground />
      <FloatingHearts count={12} />
      <HeartCursor />
      <HeartRain trigger={secret} onDone={() => undefined} />
      <HeartRain trigger={shower} variant="purple" onDone={() => undefined} />

      <Navbar onEgg={triggerSecret} onShower={triggerShower} />

      <main className="relative">
        <Hero />
        <About />
        <Projects />
        <JKZone />
        <Games />
      </main>

      <footer className="relative z-10 border-t border-bora-400/10 bg-night-900/60 py-10">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <div className="animate-heartbeat inline-block text-3xl">💜</div>
          <p className="mt-3 font-hand text-2xl text-white">KHADIZA</p>
        </div>
      </footer>
    </div>
  );
}
