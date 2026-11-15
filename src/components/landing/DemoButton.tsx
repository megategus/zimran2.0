"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spotlight } from "@/components/ui/button-2";

// Seeds a demo guest (car + a week of activity) and opens the course map.
// className swaps the default secondary Button for a custom-styled button.
// pro: jury free trial, the same demo with Pro already on. label overrides the button text.
export function DemoButton({ className, pro = false, label = "Try demo" }: { className?: string; pro?: boolean; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/guest/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pro }) });
      if (!res.ok) throw new Error();
      // Full load, not router.push: the client router can show a cached /app from the old guest.
      window.location.assign("/app");
    } catch {
      setError("Couldn't start the demo. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {className ? (
        <button type="button" className={`relative overflow-hidden ${className}`} onClick={start} disabled={busy}>
          <Spotlight />
          <span className="relative">{busy ? "Loading…" : label}</span>
        </button>
      ) : (
        <Button variant="secondary" onClick={start} disabled={busy}>
          {busy ? "Setting up demo…" : label}
        </Button>
      )}
      {error && <p role="alert" className="type-caption text-brake">{error}</p>}
    </div>
  );
}
