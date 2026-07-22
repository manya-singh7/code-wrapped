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

  const { data: chaptersRows } = await supabase
    .from("chapters_cache")
    .select("*")
    .eq("github_username", username)
    .eq("period", cached.period || "all")
    .order("created_at", { ascending: false })
    .limit(1);

  const chaptersRow = chaptersRows?.[0] || null;
  const chapters = chaptersRow?.chapters || [];

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
      mostActiveWeekday={cached.most_active_weekday}
      mostActiveHour={cached.most_active_hour}
      weekdayCommits={cached.weekday_commits || 0}
      weekendCommits={cached.weekend_commits || 0}
      topLanguages={cached.top_languages || []}
      mostStarred={cached.most_starred_repo ? { name: cached.most_starred_repo, stargazers_count: cached.total_stars } : null}
      totalRepos={cached.total_repos}
      totalStars={cached.total_stars}
      generatedDate={generatedDate}
      totalAdditions={cached.total_additions}
      totalDeletions={cached.total_deletions}
      aiStory={cached.ai_story}
      aiRoast={cached.ai_roast}
      aiHype={cached.ai_hype}
      aiQuote={cached.ai_quote}
      archetype={cached.archetype}
      longestGap={0}
      forgivingStreak={0}
      forgivingSkippedDate={null}
      commitPersonality={cached.commit_personality}
      timeline={cached.commit_timeline || []}
      totalPRs={cached.total_prs}
      mergedPRs={cached.merged_prs}
      ownRepoPRs={cached.own_repo_prs || 0}
      otherRepoPRs={cached.other_repo_prs || 0}
      prTimeline={cached.pr_timeline || []}
      contributorsToYourRepos={Array(cached.contributors_count || 0).fill("").map((_, i) => `contributor ${i + 1}`)}
      totalIssues={cached.total_issues || 0}
      totalContributions={cached.total_commits + cached.total_prs + (cached.total_issues || 0)}
      chapters={chapters}
    />
  );
}