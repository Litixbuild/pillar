export default function VerificationTitleBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-xs text-[rgba(100,80,40,0.55)] dark:text-white/40">{subtitle}</p>
      ) : null}
    </div>
  );
}
