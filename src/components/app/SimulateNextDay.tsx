"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SimulateNextDay() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      className="!py-2 !px-3"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/guest/next-day", { method: "POST" });
        router.refresh();
        setBusy(false);
      }}
    >
      Simulate next day
    </Button>
  );
}
