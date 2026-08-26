export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
      <p className="text-sm text-zinc-500">Comparing profiles...</p>
    </div>
  );
}