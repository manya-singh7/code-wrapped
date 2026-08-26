"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CompareForm() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
  e.preventDefault();
  if (username.trim()) {
    startTransition(() => {
      router.push(`/compare?friend=${encodeURIComponent(username.trim())}`);
    });
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter friend's GitHub username"
        className="rounded-full border border-zinc-300 px-4 py-2"
      />
      <button
  type="submit"
  disabled={isPending}
  className="rounded-full bg-black px-6 py-2 text-white disabled:opacity-50"
>
  {isPending ? "Loading..." : "Compare"}
</button>
    </form>
  );
}