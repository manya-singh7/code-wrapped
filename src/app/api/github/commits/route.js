import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const headers = { Authorization: `Bearer ${session.accessToken}` };

  // Get user's repos first
  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100",
    { headers }
  );
  const repos = await reposRes.json();

  // Only check repos you own (skip forks to avoid double-counting others' work)
  const ownRepos = repos.filter((r) => !r.fork);

  let allCommits = [];

  // Loop through each repo and get YOUR commits in it
  for (const repo of ownRepos.slice(0, 20)) {
    const commitsRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits?author=${session.user.name}&per_page=100`,
      { headers }
    );

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        allCommits = allCommits.concat(
          commits.map((c) => ({
            repo: repo.name,
            date: c.commit.author.date,
            message: c.commit.message,
          }))
        );
      }
    }
  }
  // ^ for loop ends here — everything below runs AFTER all repos are checked

  // Sort commits by date
  const sortedCommits = allCommits
    .map((c) => new Date(c.date))
    .sort((a, b) => a - b);

  // Get unique commit days (YYYY-MM-DD)
  const commitDays = [
  ...new Set(
    sortedCommits.map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })
  ),
].sort();

  // Calculate streaks
  let longestStreak = 0;
  let currentStreak = 0;
  let streak = 1;

  for (let i = 1; i < commitDays.length; i++) {
    const prev = new Date(commitDays[i - 1]);
    const curr = new Date(commitDays[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // Current streak: check if most recent commit day chains back from today
  if (commitDays.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const lastCommitDay = commitDays[commitDays.length - 1];
    const daysSinceLastCommit =
      (new Date(today) - new Date(lastCommitDay)) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCommit <= 1) {
      currentStreak = 1;
      for (let i = commitDays.length - 1; i > 0; i--) {
        const diff =
          (new Date(commitDays[i]) - new Date(commitDays[i - 1])) /
          (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }
  }

  // Most active weekday
  const weekdayCounts = {};
  sortedCommits.forEach((d) => {
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    weekdayCounts[day] = (weekdayCounts[day] || 0) + 1;
  });
  const mostActiveWeekday = Object.entries(weekdayCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  // Most active hour
  const hourCounts = {};
  sortedCommits.forEach((d) => {
    const hour = d.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const mostActiveHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return Response.json({
    totalCommits: allCommits.length,
    longestStreak,
    currentStreak,
    mostActiveWeekday,
    mostActiveHour: mostActiveHour ? `${mostActiveHour}:00` : null,
  });
}