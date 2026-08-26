export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] text-white gap-4">
      <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>
      <p className="text-sm text-zinc-400">Loading your Wrapped...</p>
    </div>
  );
}
