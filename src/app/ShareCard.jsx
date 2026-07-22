"use client";

import { useRef } from "react";

export default function ShareCard({
  username,
  avatarUrl,
  totalCommits,
  longestStreak,
  topLanguage,
  generatedDate,
  totalPRs,
  mergedPRs,
  contributorCount,
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
      link.download = `${username}-code-wrapped.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div>
      <div
        ref={cardRef}
        className="w-[400px] rounded-3xl p-8 shadow-2xl"
        style={{
          background: "linear-gradient(to bottom right, #4f46e5, #6d28d9)",
          color: "#ffffff",
        }}
      >
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={username} crossOrigin="anonymous" className="size-12 rounded-full" style={{ border: "2px solid #ffffff" }} />
          <div>
            <p className="font-bold">{username}</p>
            <p className="text-xs" style={{ color: "#c7d2fe" }}>Code Wrapped 2026</p>
          </div>
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#c7d2fe" }}>Longest Streak</div>
          <div style={{ display: "inline-block", marginTop: "8px" }}>
            <span style={{ fontSize: "60px", fontWeight: "bold" }}>🔥 {longestStreak}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#c7d2fe", marginTop: "8px" }}>days in a row</div>
        </div>

        <div className="mt-6 rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-sm font-medium">
            {longestStreak >= 7
              ? "Consistent coder 🔥"
              : longestStreak >= 2
              ? "Building momentum 🌱"
              : "Just getting started 🚀"}
          </p>
        </div>

        <div className="mt-6 flex justify-between text-sm">
          <div>
            <p style={{ color: "#c7d2fe" }}>Commits</p>
            <p className="font-bold">{totalCommits}</p>
          </div>
          <div>
            <p style={{ color: "#c7d2fe" }}>Top Language</p>
            <p className="font-bold">{topLanguage || "—"}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p style={{ color: "#c7d2fe" }}>PRs Merged</p>
            <p className="font-bold">{mergedPRs || 0}</p>
          </div>
          <div>
            <p style={{ color: "#c7d2fe" }}>Collaborators</p>
            <p className="font-bold">{contributorCount || 0}</p>
          </div>
        </div>

        <div className="mt-8 pt-3 text-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.2)", color: "#c7d2fe" }}>
          ✅ Based on public GitHub activity • Generated {generatedDate}
        </div>

        <p className="mt-2 text-center text-xs" style={{ color: "#c7d2fe" }}>
          Make yours at codewrapped.dev
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="relative z-50 mt-4 w-full rounded-full bg-zinc-800 px-6 py-2 text-white text-sm font-medium cursor-pointer"
      >
        📥 Download as Image
      </button>
    </div>
  );
}