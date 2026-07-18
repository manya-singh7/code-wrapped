import { auth } from "@/auth";
import CompareForm from "./CompareForm";
import { cookies } from "next/headers";

function parseCommitDateSimple(isoString, timezone) {
  const utcDate = new Date(isoString);
  if (isNaN(utcDate.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(utcDate);
  const get = (type) => parts.find((p) => p.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function getPublicStats(username, timezone, accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100`,
    { headers, cache: "no-store" }
  );

  if (!reposRes.ok) return null;

  const repos = await reposRes.json();
  if (!Array.isArray(repos)) return null;

  let totalCommits = 0;
  const languageCounts = {};
  let allCommitDates = [];
  let totalAdditions = 0;

  for (const repo of repos.slice(0, 40)) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }

    const commitsRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
      { headers, cache: "no-store" }
    );
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        totalCommits += commits.length;
        commits.forEach((c) => {
          allCommitDates.push(c.commit.author.date);
        });

        for (const commit of commits) {
          const detailRes = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`,
            { headers, cache: "no-store" }
          );
          if (detailRes.ok) {
            const detail = await detailRes.json();
            totalAdditions += detail.stats?.additions || 0;
          }
        }
      }
    }
  }

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  const commitDays = [
    ...new Set(allCommitDates.map((d) => parseCommitDateSimple(d, timezone))),
  ].filter(Boolean).sort();

  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < commitDays.length; i++) {
    const diff = (new Date(commitDays[i]) - new Date(commitDays[i - 1])) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  const prRes = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=100`,
    { headers, cache: "no-store" }
  );
  let totalPRs = 0;
  let mergedPRs = 0;
  if (prRes.ok) {
    const prData = await prRes.json();
    totalPRs = prData.total_count || 0;
    mergedPRs = (prData.items || []).filter((pr) => pr.pull_request?.merged_at).length;
  }

  const issueRes = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+type:issue&per_page=100`,
    { headers, cache: "no-store" }
  );
  let totalIssues = 0;
  if (issueRes.ok) {
    const issueData = await issueRes.json();
    totalIssues = issueData.total_count || 0;
  }

  return {
    username,
    totalRepos: repos.length,
    totalCommits,
    totalStars,
    topLanguages,
    longestStreak,
    totalPRs,
    mergedPRs,
    totalIssues,
    totalAdditions,
    totalContributions: totalCommits + totalPRs + totalIssues,
  };
}
export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const friendUsername = params.friend;
  const session = await auth();
  const cookieStore = await cookies();
  const userTimezone = cookieStore.get("tz")?.value || "Asia/Kolkata";

  let myStats = null;
  let friendStats = null;
  if (session) {
    myStats = await getPublicStats(session.githubLogin, userTimezone, session.accessToken);
  }

  if (friendUsername) {
    friendStats = await getPublicStats(friendUsername, userTimezone, session?.accessToken);
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Compare Wrapped 🆚</h1>

      <CompareForm />

      {myStats && friendStats && (
        <div className="w-full max-w-xl mt-8">
          <div className="grid grid-cols-3 items-center gap-2 text-center mb-2">
            <p className="font-bold">{myStats.username}</p>
            <p className="text-sm text-zinc-400">vs</p>
            <p className="font-bold">{friendStats.username}</p>
          </div>

          {[
            { label: "Commits", a: myStats.totalCommits, b: friendStats.totalCommits },
            { label: "Lines Added", a: myStats.totalAdditions, b: friendStats.totalAdditions },
            { label: "Longest Streak", a: myStats.longestStreak, b: friendStats.longestStreak },
            { label: "PRs Merged", a: myStats.mergedPRs, b: friendStats.mergedPRs },
            { label: "Issues Opened", a: myStats.totalIssues, b: friendStats.totalIssues },
            { label: "Stars", a: myStats.totalStars, b: friendStats.totalStars },
            { label: "Repos", a: myStats.totalRepos, b: friendStats.totalRepos },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 items-center gap-2 py-2 border-b border-zinc-100">
              <p className={`text-xl font-bold ${row.a > row.b ? "text-green-600" : "text-zinc-700"}`}>
                {row.a}
              </p>
              <p className="text-xs text-zinc-500">{row.label}</p>
              <p className={`text-xl font-bold ${row.b > row.a ? "text-green-600" : "text-zinc-700"}`}>
                {row.b}
              </p>
            </div>
          ))}

          <div className="mt-6 flex justify-center gap-8 text-sm text-zinc-500">
            <p>Top Languages: {myStats.topLanguages.join(", ") || "—"}</p>
            <p>Top Languages: {friendStats.topLanguages.join(", ") || "—"}</p>
          </div>
        </div>
      )}

      {friendUsername && !friendStats && (
        <p className="text-red-500">Couldn't find that GitHub user, or their profile is private.</p>
      )}
    </div>
  );
}