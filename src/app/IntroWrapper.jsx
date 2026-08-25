"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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

export default function IntroWrapper({ children }) {
  const [phase, setPhase] = useState("video");
  const [tagline, setTagline] = useState(null);

  useEffect(() => {
    const videoAlreadyPlayed = sessionStorage.getItem("cw_video_played");
    if (videoAlreadyPlayed) {
      setPhase("intro");
    }
  }, []);

  useEffect(() => {
    const existing = sessionStorage.getItem("cw_tagline");
    const picked = existing || taglines[Math.floor(Math.random() * taglines.length)];
    if (!existing) sessionStorage.setItem("cw_tagline", picked);
    setTagline(picked);
  }, []);

  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => setPhase("content"), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (!tagline) return null;

  if (phase === "video") {
    return (
      <IntroVideo
        onFinished={() => {
          sessionStorage.setItem("cw_video_played", "true");
          setPhase("intro");
        }}
      />
    );
  }

  if (phase === "intro") {
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
        <div className="relative overflow-hidden">
          <motion.p
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl font-bold px-6 text-center"
          >
            {tagline}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}