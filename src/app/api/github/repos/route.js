import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const repos = await res.json();

  const simplified = repos.map((repo) => ({
    name: repo.name,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
  }));

  return Response.json(simplified);
}