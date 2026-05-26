"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function QRDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this QR code? This cannot be undone.")) return;
    startTransition(async () => {
      await fetch(`/api/admin/qr-codes/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500/50 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
