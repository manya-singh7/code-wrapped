import { supabase } from "../../supabaseClient";
import WrappedSlides from "../../WrappedSlides";

export default async function PublicProfile({ params }) {
  const { username } = await params;

  const { data: cached } = await supabase
    .from("wrapped_cache")
    .select("*")
    .eq("github_username", username)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">
          No public Wrapped found for @{username} yet.
        </p>
      </div>
    );
  }

  const generatedDate = new Date(cached.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <WrappedSlides
      name={cached.github_username}
      avatarUrl={cached.avatar_url}
      totalCommits={cached.total_commits}
      longestStreak={cached.longest_streak}
      currentStreak={0}
      mostActiveWeekday={null}
      mostActiveHour={null}
      weekdayCommits={0}
      weekendCommits={0}
      topLanguages={cached.top_language ? [[cached.top_language, 1]] : []}
      mostStarred={null}
      totalRepos={0}
      totalStars={cached.total_stars}
      generatedDate={generatedDate}
      totalAdditions={0}
      totalDeletions={0}
      aiStory={cached.ai_story}
      aiRoast={cached.ai_roast}
      aiHype={cached.ai_hype}
      aiQuote={cached.ai_quote}
      archetype={cached.archetype}
      longestGap={0}
      forgivingStreak={0}
      forgivingSkippedDate={null}
      commitPersonality={cached.commit_personality}
      timeline={[]}
      totalPRs={cached.total_prs}
      mergedPRs={cached.merged_prs}
      ownRepoPRs={0}
      otherRepoPRs={0}
      prTimeline={[]}
      contributorsToYourRepos={[]}
    />
  );
}