"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Seeds a demo guest (car + a week of activity) and opens the course map.
export function DemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/guest/demo", { method: "POST" });
      if (!res.ok) throw new Error();
      router.push("/app");
    } catch {
      setError("Couldn't start the demo. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={start} disabled={busy}>
        {busy ? "Setting up demo…" : "Try demo"}
      </Button>
      {error && <p role="alert" className="type-caption text-brake">{error}</p>}
    </div>
  );
}
