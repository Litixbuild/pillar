import { createServiceClient } from "@/lib/supabase";
import Image from "next/image";
import QRCreator from "./_components/QRCreator";
import QRDeleteButton from "./_components/QRDeleteButton";
import QRDownloadButton from "./_components/QRDownloadButton";

export const dynamic = "force-dynamic";

interface QRCode {
  id: string;
  label: string;
  url: string;
  public_url: string;
  created_at: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function QRCodesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("qr_codes")
    .select("id, label, url, public_url, created_at")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as QRCode[];

  return (
    <div className="space-y-8 p-5 md:p-10">

      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/30 dark:text-white/25">
          Marketing
        </p>
        <h1 className="font-serif text-3xl font-light text-[#2C2C2C] dark:text-white md:text-4xl">
          QR Codes
        </h1>
        <p className="mt-1.5 text-sm text-black/40 dark:text-white/35">
          Generate and save QR codes for business cards, websites, and more.
        </p>
      </div>

      <QRCreator />

      {/* History */}
      <section>
        <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/25">
          History
          {items.length > 0 && (
            <span className="ml-2 font-normal text-black/25 dark:text-white/20">
              ({items.length})
            </span>
          )}
        </h2>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/8 bg-white p-12 text-center dark:border-white/6 dark:bg-[#0a1520]">
            <p className="font-serif text-lg font-light text-black/30 dark:text-white/25">
              No QR codes yet
            </p>
            <p className="mt-1 text-[11px] text-black/25 dark:text-white/20">
              Create your first one above
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((qr) => (
              <div
                key={qr.id}
                className="flex flex-col rounded-2xl border border-black/8 bg-white overflow-hidden dark:border-white/6 dark:bg-[#0a1520]"
              >
                {/* QR image */}
                <div className="flex justify-center border-b border-black/5 bg-white p-5 dark:border-white/4">
                  <Image
                    src={qr.public_url}
                    alt={qr.label}
                    width={160}
                    height={160}
                    className="rounded"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="font-medium text-[#2C2C2C] dark:text-white/90">{qr.label}</p>
                    <p className="mt-1 truncate font-mono text-[11px] text-black/35 dark:text-white/30">
                      {qr.url}
                    </p>
                  </div>
                  <p className="text-[10px] text-black/25 dark:text-white/20">{fmt(qr.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 border-t border-black/6 px-4 py-3 dark:border-white/5">
                  <QRDownloadButton url={qr.public_url} label={qr.label} />
                  <a
                    href={qr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-black/40 transition-colors hover:bg-black/4 hover:text-black/70 dark:text-white/35 dark:hover:bg-white/5 dark:hover:text-white/65"
                  >
                    Visit ↗
                  </a>
                  <QRDeleteButton id={qr.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
