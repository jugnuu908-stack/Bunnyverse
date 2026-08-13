import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* portrait */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-tr from-bora-600/30 to-pink-500/30 blur-2xl" />
          <div className="glass lift relative overflow-hidden rounded-[2rem] p-2.5">
            <img
              src="/images/khadiza-art.jpg"
              alt="Illustrated portrait of Khadiza with an ARMY bomb"
              className="w-full rounded-3xl object-cover"
            />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-hand text-2xl text-white">khadiza ✧</span>
              <span className="animate-heartbeat text-xl">💜</span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -top-5 -left-3 rounded-2xl px-4 py-2 text-sm font-semibold text-white sm:-left-5"
          >
            🎤 bias: Jung Kook
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="glass absolute -bottom-5 -right-3 rounded-2xl px-4 py-2 text-sm font-semibold text-white sm:-right-4"
          >
            💜 borahae forever
          </motion.div>
        </motion.div>

        {/* copy */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm leading-relaxed text-bora-200/75 sm:text-base">
            I don't really know when it happened, but somehow Jung Kook became a big part of my
            favorite songs, favorite moments, and little happy memories. 💜
          </p>
          <p className="mt-3 text-sm leading-relaxed text-bora-200/75 sm:text-base">
            So I made this tiny purple corner for all the JK things I love — his music, his voice, his
            smile, his performances, and everything that makes me happy. 🐰
          </p>
          <p className="mt-3 text-sm leading-relaxed text-bora-200/75 sm:text-base">
            Welcome to my little world. 💜
          </p>
          <p className="mt-6 font-hand text-3xl text-shine">Welcome to Khadiza's Bunnyverse. ✨</p>
          <p className="mt-2 font-hand text-xl text-bora-200/60">— Khadiza</p>
        </motion.div>
      </div>
    </section>
  );
}
