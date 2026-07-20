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
})  {
  return (
    <div className="w-[400px] rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-2xl">
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt={username} className="size-12 rounded-full border-2 border-white" />
        <div>
          <p className="font-bold">{username}</p>
          <p className="text-xs text-indigo-200">Code Wrapped 2026</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-indigo-200">Longest Streak</p>
        <p className="text-6xl font-bold">🔥 {longestStreak}</p>
        <p className="text-sm text-indigo-200">days in a row</p>
      </div>

      <div className="mt-6 rounded-xl bg-white/10 p-3">
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
          <p className="text-indigo-200">Commits</p>
          <p className="font-bold">{totalCommits}</p>
        </div>
        <div>
          <p className="text-indigo-200">Top Language</p>
          <p className="font-bold">{topLanguage || "—"}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-indigo-200">PRs Merged</p>
          <p className="font-bold">{mergedPRs || 0}</p>
        </div>
        <div>
          <p className="text-indigo-200">Collaborators</p>
          <p className="font-bold">{contributorCount || 0}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/20 pt-3 text-[10px] text-indigo-200">
        ✅ Based on public GitHub activity • Generated {generatedDate}
      </div>

      <p className="mt-2 text-center text-xs text-indigo-200">
        Make yours at codewrapped.dev
      </p>
    </div>
  );
}