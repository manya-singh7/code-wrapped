import { auth, signIn, signOut } from "@/auth";

async function getRepos(accessToken) {
  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return res.json();
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold">Code Wrapped 🎁</h1>
      <p>Signed in as {session.user.name}</p>

      <div className="mt-6 w-full max-w-md rounded-2xl border border-zinc-200 p-6 text-center">
        <p className="text-3xl font-bold">{totalRepos}</p>
        <p className="text-zinc-500">Total Repositories</p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-6 text-center">
        <p className="text-3xl font-bold">⭐ {totalStars}</p>
        <p className="text-zinc-500">Total Stars</p>
      </div>

      {mostStarred && (
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-6 text-center">
          <p className="text-xl font-bold">{mostStarred.name}</p>
          <p className="text-zinc-500">
            Most Starred Repo ({mostStarred.stargazers_count} ⭐)
          </p>
        </div>
      )}

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-6 text-center">
        <p className="font-bold mb-2">Top Languages</p>
        {topLanguages.map(([lang, count]) => (
          <p key={lang} className="text-zinc-500">
            {lang}: {count} repo{count > 1 ? "s" : ""}
          </p>
        ))}
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