import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Code Wrapped 🎁</h1>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p>Signed in as {session.user.name}</p>
          <img
            src={session.user.image}
            alt="avatar"
            className="w-16 h-16 rounded-full"
          />
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="rounded-full bg-zinc-800 px-6 py-3 text-white">
              Sign out
            </button>
          </form>
        </div>
      ) : (
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
      )}
    </div>
  );
}