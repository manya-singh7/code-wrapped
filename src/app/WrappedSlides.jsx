import ShareCard from "./ShareCard";
export default function WrappedSlides({
  name,
  avatarUrl,
  totalCommits,
  longestStreak,
  currentStreak,
  mostActiveWeekday,
  mostActiveHour,
  weekdayCommits,
  weekendCommits,
  topLanguages,
  mostStarred,
  totalRepos,
  totalStars,
  streakPercentile,
  generatedDate,
  totalAdditions,
  totalDeletions,
}) {
  const slideBase =
    "h-screen w-full flex flex-col items-center justify-center snap-start px-6 text-center";

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {/* Slide 1: Intro */}
      <section className={`${slideBase} bg-black text-white`}>
        <h1 className="text-2xl mb-2">Your Code Wrapped</h1>
        <p className="text-5xl font-bold">{name}</p>
        <p className="mt-6 text-zinc-400 text-sm">Scroll to see your year ↓</p>
      </section>

      {/* Slide 2: Total Commits */}
      <section className={`${slideBase} bg-indigo-600 text-white`}>
        <p className="text-xl mb-4">You made</p>
        <p className="text-8xl font-bold">{totalCommits}</p>
        <p className="text-2xl mt-4">commits</p>
      </section>

      {/* Slide: Lines of Code */}
      <section className={`${slideBase} bg-cyan-600 text-white`}>
        <p className="text-xl mb-4">You wrote</p>
        <p className="text-6xl font-bold text-green-300">+{totalAdditions}</p>
        <p className="text-6xl font-bold text-red-300 mt-2">-{totalDeletions}</p>
        <p className="text-xl mt-4">lines of code</p>
      </section>

      {/* Slide 3: Longest Streak */}
      <section className={`${slideBase} bg-orange-500 text-white`}>
        <p className="text-xl mb-4">Your longest streak was</p>
        <p className="text-8xl font-bold">🔥 {longestStreak}</p>
        <p className="text-2xl mt-4">days in a row</p>
      </section>

      {/* Slide 4: Active Day/Hour */}
      <section className={`${slideBase} bg-teal-600 text-white`}>
        <p className="text-xl mb-4">You're most active on</p>
        <p className="text-6xl font-bold">{mostActiveWeekday || "—"}</p>
        <p className="text-xl mt-6">around</p>
        <p className="text-6xl font-bold mt-2">{mostActiveHour || "—"}</p>
      </section>

      {/* Slide 5: Weekday vs Weekend */}
      <section className={`${slideBase} bg-pink-600 text-white`}>
        <p className="text-xl mb-4">Weekday vs Weekend</p>
        <p className="text-6xl font-bold">
          {weekdayCommits} / {weekendCommits}
        </p>
        <p className="text-xl mt-6">
          {weekdayCommits > weekendCommits
            ? "You're a weekday warrior 💼"
            : "You code hard on weekends too 🎉"}
        </p>
      </section>

      {/* Slide 6: Top Languages */}
      <section className={`${slideBase} bg-emerald-600 text-white`}>
        <p className="text-xl mb-6">Your top languages</p>
        {topLanguages.length > 0 ? (
          topLanguages.map(([lang, count]) => (
            <p key={lang} className="text-3xl font-bold mb-2">
              {lang} — {count} repo{count > 1 ? "s" : ""}
            </p>
          ))
        ) : (
          <p className="text-2xl">No languages yet</p>
        )}
      </section>

      {/* Slide 7: Most Starred Repo */}
      <section className={`${slideBase} bg-yellow-500 text-black`}>
        <p className="text-xl mb-4">Your top repo</p>
        {mostStarred ? (
          <>
            <p className="text-5xl font-bold">{mostStarred.name}</p>
            <p className="text-2xl mt-4">⭐ {mostStarred.stargazers_count} stars</p>
          </>
        ) : (
          <p className="text-2xl">Nothing starred yet</p>
        )}
      </section>

      {/* Slide 8: Totals */}
      <section className={`${slideBase} bg-violet-600 text-white`}>
        <p className="text-xl mb-4">Overall</p>
        <p className="text-6xl font-bold">{totalRepos}</p>
        <p className="text-xl mt-2">repositories</p>
        <p className="text-6xl font-bold mt-6">⭐ {totalStars}</p>
        <p className="text-xl mt-2">total stars</p>
      </section>

      {/* Slide 9: Outro + Share Card */}
      <section className={`${slideBase} bg-black text-white gap-6`}>
        <p className="text-3xl font-bold">That's a wrap 🎁</p>
        <ShareCard
          username={name}
          avatarUrl={avatarUrl}
          totalCommits={totalCommits}
          longestStreak={longestStreak}
          streakPercentile={streakPercentile}
          topLanguage={topLanguages[0]?.[0]}
          generatedDate={generatedDate}
        />
      </section>
    </div>
  );
}