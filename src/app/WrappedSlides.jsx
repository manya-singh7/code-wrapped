import ShareCard from "./ShareCard";
import CommitTimelineChart from "./CommitTimelineChart";
import CollaborationChart from "./CollaborationChart";
import PRTimelineChart from "./PRTimelineChart";

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
  aiStory,
  aiRoast,
  aiHype,
  aiQuote,
  archetype,
  longestGap,
  forgivingStreak,
  commitPersonality,
  timeline,
  forgivingSkippedDate,
  totalPRs,
  mergedPRs,
  ownRepoPRs,
  otherRepoPRs,
  prTimeline,
  contributorsToYourRepos,
  totalIssues,
  totalContributions
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

      {/* Slide: AI Story */}
      <section className={`${slideBase} bg-gradient-to-br from-purple-700 to-indigo-800 text-white`}>
        <p className="text-2xl leading-relaxed max-w-lg">{aiStory}</p>
      </section>

      {/* Slide: Archetype */}
      <section className={`${slideBase} bg-slate-800 text-white`}>
        <p className="text-xl mb-4">Your developer archetype</p>
        <p className="text-5xl font-bold">{archetype}</p>
      </section>

      {/* Slide: Commit Message Personality */}
      <section className={`${slideBase} bg-fuchsia-700 text-white`}>
        <p className="text-xl mb-4">Your commit message personality</p>
        <p className="text-4xl font-bold">{commitPersonality?.label}</p>
        <p className="mt-4 text-fuchsia-100">{commitPersonality?.description}</p>
      </section>

      {/* Slide: AI Roast */}
      <section className={`${slideBase} bg-rose-600 text-white`}>
        <p className="text-sm uppercase tracking-wide mb-4 text-rose-200">A gentle roast</p>
        <p className="text-2xl leading-relaxed max-w-lg">{aiRoast}</p>
      </section>

      {/* Slide: AI Hype */}
      <section className={`${slideBase} bg-amber-500 text-black`}>
        <p className="text-sm uppercase tracking-wide mb-4">The hype</p>
        <p className="text-2xl leading-relaxed max-w-lg font-medium">{aiHype}</p>
      </section>

      {/* Slide: Total Commits */}
      <section className={`${slideBase} bg-indigo-600 text-white`}>
        <p className="text-xl mb-4">You made</p>
        <p className="text-8xl font-bold">{totalCommits}</p>
        <p className="text-2xl mt-4">commits</p>
      </section>

      {/* Slide: Commit Timeline */}
      <section className={`${slideBase} bg-zinc-900 text-white`}>
        <p className="text-xl mb-6">Your activity over time</p>
        <div className="w-full max-w-lg px-4">
          <CommitTimelineChart timeline={timeline} />
        </div>
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
        {forgivingStreak > longestStreak && forgivingSkippedDate && (
          <p className="mt-6 text-sm text-orange-100 max-w-xs">
            If you hadn't skipped{" "}
            {new Date(forgivingSkippedDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
            , you'd have had a {forgivingStreak}-day streak
          </p>
        )}
        {longestGap > 0 && (
          <p className="mt-2 text-sm text-orange-100 max-w-xs">
            Longest break: {longestGap} day{longestGap > 1 ? "s" : ""}
          </p>
        )}
      </section>

      {/* Slide : Active Day/Hour */}
      <section className={`${slideBase} bg-teal-600 text-white`}>
        <p className="text-xl mb-4">You're most active on</p>
        <p className="text-6xl font-bold">{mostActiveWeekday || "—"}</p>
        <p className="text-xl mt-6">around</p>
        <p className="text-6xl font-bold mt-2">{mostActiveHour || "—"}</p>
      </section>

      {/* Slide : Weekday vs Weekend */}
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

      {/* Slide : Top Languages */}
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

      {/* Slide : Most Starred Repo */}
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

      {/* Slide : Totals */}
      <section className={`${slideBase} bg-violet-600 text-white`}>
        <p className="text-xl mb-4">Overall</p>
        <p className="text-6xl font-bold">{totalRepos}</p>
        <p className="text-xl mt-2">repositories</p>
        <p className="text-6xl font-bold mt-6">⭐ {totalStars}</p>
        <p className="text-xl mt-2">total stars</p>
      </section>

      {/* Slide: Collaboration Breakdown */}
      <section className={`${slideBase} bg-indigo-900 text-white`}>
        <p className="text-xl mb-1">Total Contributions</p>
        <p className="text-5xl font-bold mb-2">{totalContributions}</p>
        <p className="text-sm text-indigo-200 mb-6">
          {totalCommits} commits · {totalPRs} PRs · {totalIssues} issues
        </p>
        <p className="text-lg mb-1">{mergedPRs} PRs merged</p>
        <p className="text-lg text-indigo-200 mb-6">{contributorsToYourRepos?.length || 0} people contributed to your work</p>
        <div className="w-full max-w-sm">
          <CollaborationChart
            ownRepoPRs={ownRepoPRs}
            otherRepoPRs={otherRepoPRs}
            incomingCount={contributorsToYourRepos?.length || 0}
          />
        </div>
      </section>

      {/* Slide: PR Timeline */}
      <section className={`${slideBase} bg-purple-900 text-white`}>
        <p className="text-xl mb-6">Your collaboration over time</p>
        <div className="w-full max-w-lg px-4">
          <PRTimelineChart timeline={prTimeline} />
        </div>
      </section>

      {/* Slide 9: Outro + Share Card */}
      <section className={`${slideBase} bg-black text-white gap-6`}>
        <p className="text-3xl font-bold">That's a wrap 🎁</p>
        <p className="text-lg italic text-zinc-300 max-w-md">"{aiQuote}"</p>
        <ShareCard
          username={name}
          avatarUrl={avatarUrl}
          totalCommits={totalCommits}
          longestStreak={longestStreak}
          streakPercentile={streakPercentile}
          topLanguage={topLanguages[0]?.[0]}
          generatedDate={generatedDate}
          totalPRs={totalPRs}
          mergedPRs={mergedPRs}
          contributorCount={contributorsToYourRepos?.length || 0}
        />
      </section>
    </div>
  );
}