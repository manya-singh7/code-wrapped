"use client";

import {motion} from "framer-motion";
import {useState, useEffect} from "react";
import IntroVideo from "./IntroVideo";

const taglines = [
  "Your code, decoded.",
  "Ship happens. We track it.",
  "Push. Pull. Reflect.",
  "You wrote the code. We'll write the story.",
  "Behind every green square, a story.",
  "You built more than you think.",
  "Your work speaks. We're just translating.",
  "Proof you showed up. Beautifully told.",
  "A git-brag tool.",
  "You've done more than your GitHub shows. We'll prove it.",
];

export default function IntroSequence ({signInAction}) {
    const [phase, setPhase]=useState("video");
    const [showSignIn, setShowSignIn]=useState(false);
    const [tagline, setTagline]=useState(null)

    useEffect(() => {
        const existing = sessionStorage.getItem("cw_tagline");
        if (existing) {
            setTagline (existing);
        } else {
            const picked = taglines [Math.floor(Math.random()*taglines.length)];
            sessionStorage.setItem("cw_tagline", picked);
            setTagline(picked);
        }
    }, []);

    if (!tagline) return null;

    if (phase ==="video") {
      return <IntroVideo onFinished={()=> setPhase("tagline")} />;
    }

    const words=tagline.split(" ");

      return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] text-white overflow-hidden">
            <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-sm uppercase tracking-widest text-zinc-400 mb-6"
      >
        Code Wrapped
      </motion.p>

      <motion.div
        className="flex flex-wrap justify-center gap-x-4 text-5xl sm:text-6xl font-bold"
        initial="hidden"
        animate="visible"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.8 + i * 0.25,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            onAnimationComplete={() => {
              if (i === words.length - 1) {
                setTimeout(() => setShowSignIn(true), 900);
              }
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      {showSignIn && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12"
        >
          <form action={signInAction}>
            <button
              type="submit"
              className="rounded-full bg-white px-8 py-3 text-[#0B0E14] font-medium hover:bg-zinc-200 transition-colors"
            >
              Sign in with GitHub
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
