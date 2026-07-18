"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompareForm() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/compare?friend=${encodeURIComponent(username.trim())}`);
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
        className="rounded-full bg-black px-6 py-2 text-white"
      >
        Compare
      </button>
    </form>
  );
}