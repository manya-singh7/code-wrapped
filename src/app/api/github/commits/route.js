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
    // limiting to 20 repos for now to avoid rate limits while testing
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

  return Response.json({ totalCommits: allCommits.length, commits: allCommits });
}