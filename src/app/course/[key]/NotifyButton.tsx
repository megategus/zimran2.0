"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NotifyButton({ courseKey }: { courseKey: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (state === "done") return <p className="type-body-lg" role="status">We&apos;ll tell you when it&apos;s ready.</p>;
  return (
    <div className="flex flex-col gap-2">
      <Button
        full
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          const res = await fetch("/api/notify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ courseKey }) });
          setState(res.ok ? "done" : "error");
        }}
      >
        Notify me
      </Button>
      {state === "error" && <p className="type-caption text-brake" role="alert">Something went wrong. Try again.</p>}
    </div>
  );
}
