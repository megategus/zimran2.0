"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PartArt } from "@/components/art/PartArt";
import { Tag } from "@/components/ui/primitives";
import { ArrowLink, headline, SiteNav } from "@/components/ui/site";
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
  // "Find the part" game: the lab asks for a part, a correct click gives XP (once per part per day, server-side).
  const [target, setTarget] = useState<string | null>(null);
  const [gameMsg, setGameMsg] = useState<string | null>(null);

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
  const nameOf = (k: string) => PARTS.find((p) => p.key === k)?.name ?? k;
  const nextTarget = (not?: string) => {
    const pool = PARTS.filter((p) => p.key !== not);
    return pool[Math.floor(Math.random() * pool.length)].key;
  };
  async function pick(k: string) {
    setSelected(k);
    if (!target) return;
    if (k !== target) return setGameMsg(`That's the ${nameOf(k).toLowerCase()}. Find the ${nameOf(target).toLowerCase()}.`);
    const res = await fetch("/api/lab/find", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ part: k }) }).catch(() => null);
    const gained = (await res?.json().catch(() => null))?.xpGained ?? 0;
    setXp((x) => x + gained);
    const nt = nextTarget(k);
    setTarget(nt);
    setGameMsg(`Found it${gained ? `, +${gained} XP` : " (already found today)"}. Now find the ${nameOf(nt).toLowerCase()}.`);
  }

  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16 flex flex-col gap-4">
      <SiteNav left={[{ href: "/app", label: "My courses" }]} right={[{ href: "/chat", label: "AI Mechanic" }]} />
      <header className="flex items-end justify-between gap-3 pt-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`${headline} text-ink text-[48px] leading-none md:text-[64px]`}>3D Brake <span className="text-brand">Lab</span></h1>
            <Tag tone="plate">Pro</Tag>
          </div>
          <p className="type-data text-ink-muted truncate">{car ? `${car.year} ${car.make} ${car.model}` : failed ? "Couldn't load your car. Reload the page." : "Loading your car…"}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="type-data text-amber-ink">{xp} XP</span>
        </div>
      </header>

      {car && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-plate overflow-hidden border-2 border-plate">
              <div className="h-[320px] md:h-[440px]">
                {webgl ? (
                  <BrakeAssembly selected={selected} onSelect={pick} explode={explode} />
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
            <div className="flex flex-wrap items-center gap-4 border-l-4 border-brand bg-surface px-4 py-3">
              {target ? (
                <>
                  <p className="type-body text-ink flex-1" role="status">{gameMsg ?? <>Find the <strong className="text-brand">{nameOf(target).toLowerCase()}</strong>. Tap it in 3D or below.</>}</p>
                  <button type="button" onClick={() => { setTarget(null); setGameMsg(null); }} className="type-body text-ink-muted underline cursor-pointer">Stop</button>
                </>
              ) : (
                <>
                  <p className="type-body text-ink flex-1">Game: the lab names a part, you tap it. +3 XP for each part you find.</p>
                  <button type="button" onClick={() => { setTarget(nextTarget()); setGameMsg(null); }} className="bg-brand text-on-brand px-4 py-2 type-label text-[12px] cursor-pointer">Find the part</button>
                </>
              )}
            </div>
            <p className="type-caption text-ink-muted">Drag to rotate, pinch or scroll to zoom. Tap a part to learn it. Generic front disc brake, not a model of your exact car.</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {PARTS.map((p) => {
                const on = p.key === selected;
                return (
                  <li key={p.key}>
                    <button type="button" aria-pressed={on} onClick={() => pick(p.key)} className={`w-full h-full rounded-lg bg-surface p-3 flex flex-col items-center gap-2 text-center cursor-pointer ${on ? "border-2 border-brand shadow-press-brand" : "border border-line"}`}>
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
              <>
              <div className="mb-4"><ArrowLink href="/lesson/brakes-2">What fails here?</ArrowLink></div>
              <PartPanel key={part.key} partKey={part.key} name={part.name} onXp={(n) => setXp((x) => x + n)} />
              </>
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
