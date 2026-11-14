"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PartArt } from "@/components/art/PartArt";
import { Tag } from "@/components/ui/primitives";
import { PARTS } from "@/content/catalog";
import type { Car } from "@/lib/types";
import { PartPanel } from "./PartPanel";

const BrakeAssembly = dynamic(() => import("./BrakeAssembly").then((m) => m.BrakeAssembly), {
  ssr: false,
  loading: () => <p className="p-6 text-on-plate">Loading the 3D lab…</p>,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function LabView() {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [xp, setXp] = useState(0);
  const [webgl, setWebgl] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [explode, setExplode] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let off = false;
    setWebgl(hasWebGL());
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((me) => {
        if (off) return;
        if (!me?.car) return router.replace("/onboarding");
        if (!me.guest?.isPremium) return router.replace("/pricing");
        setCar(me.car);
        setXp(me.xp ?? me.guest.xp ?? 0);
      })
      .catch(() => !off && setFailed(true));
    return () => { off = true; };
  }, [router]);

  const part = PARTS.find((p) => p.key === selected);

  return (
    <main className="mx-auto max-w-[960px] px-4 py-4 md:py-8 flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="type-h2">3D Brake Lab</h1>
            <Tag tone="plate">Pro</Tag>
          </div>
          <p className="type-data text-ink-muted truncate">{car ? `${car.year} ${car.make} ${car.model}` : failed ? "Couldn't load your car. Reload the page." : "Loading your car…"}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="type-data text-amber-ink">{xp} XP</span>
          <Link href="/app" className="type-label text-ink-muted hover:text-ink">My course</Link>
        </div>
      </header>

      {car && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-plate overflow-hidden border-2 border-plate">
              <div className="h-[320px] md:h-[440px]">
                {webgl ? (
                  <BrakeAssembly selected={selected} onSelect={setSelected} explode={explode} />
                ) : (
                  <p className="p-6 text-on-plate">Your browser can&apos;t show 3D here. Pick a part below to learn it.</p>
                )}
              </div>
              {webgl && (
                <label className="flex items-center gap-3 px-4 py-3 text-on-plate">
                  <span className="type-label">Explode</span>
                  <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} className="flex-1 accent-brand" />
                </label>
              )}
            </div>
            <p className="type-caption text-ink-muted">Drag to rotate, pinch or scroll to zoom. Tap a part to learn it. Generic front disc brake, not a model of your exact car.</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {PARTS.map((p) => {
                const on = p.key === selected;
                return (
                  <li key={p.key}>
                    <button type="button" aria-pressed={on} onClick={() => setSelected(p.key)} className={`w-full h-full rounded-lg bg-surface p-3 flex flex-col items-center gap-2 text-center cursor-pointer ${on ? "border-2 border-brand shadow-press-brand" : "border border-line"}`}>
                      <PartArt part={p.key.replace("part-", "")} size={48} label="" />
                      <span className="type-h3 text-[15px] leading-5">{p.name}</span>
                      {on && <Tag tone="brand">In 3D lab</Tag>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="rounded-lg bg-surface border border-line shadow-raise p-4 md:p-6" aria-live="polite">
            {part ? (
              <PartPanel key={part.key} partKey={part.key} name={part.name} onXp={(n) => setXp((x) => x + n)} />
            ) : (
              <div className="flex flex-col gap-2">
                <h2 className="type-h2">Pick a part</h2>
                <p className="text-ink-muted">Tap the rotor, caliper, pads, bracket or hub. You&apos;ll get a short lesson about it on your {car.model}, then a 3-question quiz.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
