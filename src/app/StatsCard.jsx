"use client";

import { useRef } from "react";

export default function StatsCard({
  username,
  avatarUrl,
  archetype,
  longestStreak,
  totalCommits,
  totalAdditions,
  totalPRs,
  mergedPRs,
  totalContributions,
  contributorCount,
  topLanguages,
  topRepoName,
  overallPercentile,
  aiQuote,
  generatedDate,
  featuredBadge,
  weeklySpotlightStatus,
  heatmapWeeks,
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
      link.download = `${username}-code-wrapped-stats.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  // Only use weeks that have a full 7 days, so the heatmap grid is a clean rectangle
  const cleanWeeks = heatmapWeeks || [];

  return (
    <div style={{ width: "min(90vw, 480px)" }}>
      <div
        ref={cardRef}
        style={{
          background: "#FAFAF7",
          color: "#1A1A18",
          width: "100%",
          padding: "20px",
          borderRadius: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <img
            src={avatarUrl}
            alt={username}
            crossOrigin="anonymous"
            style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #1A1A18" }}
          />
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>@{username}</p>
            <p style={{ fontSize: 10, color: "#7A7A70", margin: 0 }}>{archetype || "Developer"}</p>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "12px 14px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 10, color: "#7A7A70", margin: 0 }}>Longest Streak</p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🔥 {longestStreak} days</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Commits</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{totalCommits}</p>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Lines Written</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{totalAdditions?.toLocaleString()}</p>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>PRs Merged</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{mergedPRs} / {totalPRs}</p>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Total Contributions</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{totalContributions}</p>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 12px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", gap: "8px" }}>
          <div>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Collaborators</p>
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{contributorCount}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Top Languages</p>
            <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{topLanguages}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: "#7A7A70", margin: 0 }}>Top Repo</p>
            <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{topRepoName || "—"}</p>
          </div>
        </div>

        {overallPercentile && (
          <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "8px 12px", marginBottom: "10px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#4338CA", margin: 0 }}>
              🏆 Top {overallPercentile.topPercent}% overall of {overallPercentile.totalUsers} Code Wrapped users
            </p>
          </div>
        )}

        {(featuredBadge || weeklySpotlightStatus) && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {featuredBadge && (
               <div style={{ background: "#FEF3C7", borderRadius: 14, padding: "8px 12px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "36px" }}>
               <p style={{ fontSize: 10, fontWeight: 600, color: "#92400E", margin: 0, textAlign: "center" }}>
               {featuredBadge.title}
               </p>
               </div>
            )}
            {weeklySpotlightStatus && (
               <div style={{ background: "#FCE7F3", borderRadius: 14, padding: "8px 12px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "36px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#9D174D", margin: 0, textAlign: "center" }}>
                {weeklySpotlightStatus}
                </p>
                </div>
            )}
          </div>
        )}

        {aiQuote && (
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#4A4A44", marginBottom: "10px", marginTop: 0 }}>
            "{aiQuote}"
          </p>
        )}

        {cleanWeeks.length > 0 && (
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {cleanWeeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 1,
                        backgroundColor:
                          day.count === 0 ? "#E5E5E0" :
                          day.count === 1 ? "#B8E6C1" :
                          day.count <= 3 ? "#5FD068" :
                          "#2FA84A",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid #E5E5E0", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 8, color: "#9A9A90", margin: 0 }}>✅ Based on public GitHub activity • {generatedDate}</p>
          <p style={{ fontSize: 8, color: "#9A9A90", fontWeight: 600, margin: 0 }}>codewrapped.dev</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="relative z-50 mt-3 w-full rounded-full bg-zinc-800 px-6 py-2 text-white text-sm font-medium cursor-pointer"
      >
        📥 Download Stats Card
      </button>
    </div>
  );
}