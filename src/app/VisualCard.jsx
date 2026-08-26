"use client";

import { useRef } from "react";
import WorldMap from "./WorldMap";

export default function VisualCard({
  username,
  avatarUrl,
  heatmapWeeks,
  worldMapLocations,
  generatedDate,
}) {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    const html2canvas = (await import("html2canvas")).default;
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${username}-code-wrapped-visual.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div style={{ width: "min(92vw, 560px)" }}>
      <div
        ref={cardRef}
        style={{
          background: "#0B0E14",
          color: "#E6EDF3",
          width: "100%",
          padding: "24px",
          borderRadius: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <img
            src={avatarUrl}
            alt={username}
            crossOrigin="anonymous"
            style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #E6EDF3" }}
          />
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>@{username}'s year, visualized</p>
        </div>

        <div>
           <p style={{ fontSize: 13, color: "#8B96A5", marginBottom: "10px" }}>Your Global Collaboration</p>
           <div style={{ background: "#141922", borderRadius: 14, padding: "12px" }}>
               <WorldMap locations={worldMapLocations} />
           </div>
        </div>

        <div style={{ borderTop: "1px solid #232936", paddingTop: "10px", marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 8, color: "#8B96A5", margin: 0 }}>✅ Based on public GitHub activity • {generatedDate}</p>
          <p style={{ fontSize: 8, color: "#8B96A5", fontWeight: 600, margin: 0 }}>codewrapped.dev</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="relative z-50 mt-3 w-full rounded-full bg-zinc-800 px-6 py-2 text-white text-sm font-medium cursor-pointer"
      >
        📥 Download Visual Card
      </button>
    </div>
  );
}