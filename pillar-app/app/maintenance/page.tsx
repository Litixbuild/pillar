import Image from "next/image";

export const dynamic = "force-static";

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center bg-white dark:bg-black">
      <Image
        src="/images/pillarlogogoogleblack.png"
        alt="Pillar"
        width={140}
        height={94}
        priority
        className="block dark:hidden"
        style={{ objectFit: "contain", width: "auto", height: 40 }}
      />
      <Image
        src="/images/pillarlogogoogle.png"
        alt="Pillar"
        width={140}
        height={94}
        priority
        className="hidden dark:block"
        style={{ objectFit: "contain", width: "auto", height: 40 }}
      />
      <div className="max-w-sm">
        <h1 className="text-xl font-light tracking-tight text-black dark:text-white">
          We&apos;re Updating Our Site
        </h1>
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">
          Pillar is offline for scheduled updates. We&apos;ll be back shortly — thanks for your patience.
        </p>
      </div>
    </div>
  );
}
