import { auth, signIn, signOut } from "@/auth";

async function getRepos(accessToken) {
  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return res.json();
}

async function getCommitStats(accessToken, username) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100",
    { headers, cache: "no-store" }
  );
  const repos = await reposRes.json();
  const ownRepos = repos.filter((r) => !r.fork);

  let allCommits = [];

  for (const repo of ownRepos.slice(0, 20)) {
    const commitsRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
      { headers, cache: "no-store" }
    );

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        allCommits = allCommits.concat(
          commits.map((c) => new Date(c.commit.author.date))
        );
      }
    }
  }

  const sortedCommits = allCommits.sort((a, b) => a - b);

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

  const weekdayCounts = {};
  sortedCommits.forEach((d) => {
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    weekdayCounts[day] = (weekdayCounts[day] || 0) + 1;
  });
  const mostActiveWeekday = Object.entries(weekdayCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const hourCounts = {};
  sortedCommits.forEach((d) => {
    const hour = d.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const mostActiveHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  let weekendCommits = 0;
  let weekdayCommits = 0;
  sortedCommits.forEach((d) => {
    const day = d.getDay();
    if (day === 0 || day === 6) {
      weekendCommits++;
    } else {
      weekdayCommits++;
    }
  });

  const avgCommitsPerActiveDay =
    commitDays.length > 0
      ? (allCommits.length / commitDays.length).toFixed(1)
      : 0;

  return {
    totalCommits: allCommits.length,
    longestStreak,
    currentStreak,
    mostActiveWeekday,
    mostActiveHour: mostActiveHour ? `${mostActiveHour}:00` : null,
    weekendCommits,
    weekdayCommits,
    avgCommitsPerActiveDay,
  };
}

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold">Code Wrapped 🎁</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }

  const repos = await getRepos(session.accessToken);
  const commitStats = await getCommitStats(session.accessToken, session.user.name);

  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const mostStarred = repos.reduce(
    (max, r) => (r.stargazers_count > (max?.stargazers_count || 0) ? r : max),
    null
  );

  const languageCounts = {};
  repos.forEach((r) => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <h1 className="text-4xl font-bold">Code Wrapped 🎁</h1>
      <p>Signed in as {session.user.name}</p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">{totalRepos}</p>
          <p className="text-zinc-500">Total Repositories</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">⭐ {totalStars}</p>
          <p className="text-zinc-500">Total Stars</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">{commitStats.totalCommits}</p>
          <p className="text-zinc-500">Total Commits</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">🔥 {commitStats.longestStreak}</p>
          <p className="text-zinc-500">Longest Streak (days)</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">{commitStats.currentStreak}</p>
          <p className="text-zinc-500">Current Streak (days)</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-xl font-bold">{commitStats.mostActiveWeekday || "—"}</p>
          <p className="text-zinc-500">Most Active Weekday</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-xl font-bold">{commitStats.mostActiveHour || "—"}</p>
          <p className="text-zinc-500">Most Active Hour</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">
            {commitStats.weekdayCommits} / {commitStats.weekendCommits}
          </p>
          <p className="text-zinc-500">Weekday vs Weekend Commits</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-3xl font-bold">{commitStats.avgCommitsPerActiveDay}</p>
          <p className="text-zinc-500">Avg Commits per Active Day</p>
        </div>

        {mostStarred && (
          <div className="rounded-2xl border border-zinc-200 p-6 text-center">
            <p className="text-xl font-bold">{mostStarred.name}</p>
            <p className="text-zinc-500">
              Most Starred Repo ({mostStarred.stargazers_count} ⭐)
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="font-bold mb-2">Top Languages</p>
          {topLanguages.length > 0 ? (
            topLanguages.map(([lang, count]) => (
              <p key={lang} className="text-zinc-500">
                {lang}: {count} repo{count > 1 ? "s" : ""}
              </p>
            ))
          ) : (
            <p className="text-zinc-500">—</p>
          )}
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="rounded-full bg-zinc-800 px-6 py-3 text-white mt-4">
          Sign out
        </button>
      </form>
    </div>
  );
}