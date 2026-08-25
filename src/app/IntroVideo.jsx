"use client";

import {useState} from "react";

export default function IntroVideo ({onFinished}) {
    const [fading, setFading]=useState(false);

    const handleVideoEnd = () => {
  console.log("VIDEO: onEnded fired");
  setFading(true);
  setTimeout(() => {
    console.log("VIDEO: calling onFinished");
    onFinished();
  }, 800);
};

    return (
        <div className="fixed inset-0 bg-[#0B0E14] z-50 flex items-center justify-center">
            <video
  autoPlay
  muted
  playsInline
  onEnded={handleVideoEnd}
  style={{
    opacity: fading ? 0 : 1,
    transition: "opacity 0.8s ease",
  }}
  className="w-full h-full object-cover"
>
  <source src="/intro-logo.mp4" type="video/mp4" />
</video>
        </div>
    );
}