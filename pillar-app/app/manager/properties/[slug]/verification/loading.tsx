export default function VerificationLoading() {
  return (
    <div className="flex flex-1 flex-col animate-pulse">
      <div className="flex items-center justify-center">
        <div className="h-2.5 w-24 rounded bg-[rgba(100,80,40,0.10)] dark:bg-white/8" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <div className="mb-4">
            <div className="h-6 w-48 rounded bg-[rgba(100,80,40,0.12)] dark:bg-white/10" />
            <div className="mt-2.5 h-3 w-full max-w-sm rounded bg-[rgba(100,80,40,0.08)] dark:bg-white/6" />
          </div>

          <div className="mb-3 h-24 rounded-2xl bg-[rgba(100,80,40,0.06)] dark:bg-white/5" />
          <div className="h-56 rounded-2xl bg-[rgba(100,80,40,0.06)] dark:bg-white/5" />
        </div>
      </div>
    </div>
  );
}
