"use client";

import { DoorOpen, FileText, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { ArrowButton, headline, SiteNav } from "@/components/ui/site";
import type { Car } from "@/lib/types";

const input = "w-full rounded-md border-2 border-line-strong bg-surface px-3 py-3 type-body-lg focus:outline-none focus:border-brand";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// POST /api/car takes {vin} or {year, make, model} (Task B1).
export default function Onboarding() {
  const router = useRouter();
  const [vin, setVin] = useState("");
  const [ymm, setYmm] = useState({ year: "", make: "", model: "" });
  const [showYmm, setShowYmm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<Car | null>(null); // decoded car, waiting for "this is it?"

  async function send(body: object) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/car", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(false);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.car) return setFound(data.car);
    setError(data?.error ?? "Something went wrong. Try again.");
    if (res?.status === 400) setShowYmm(true);
  }

  const onVin = (e: FormEvent) => {
    e.preventDefault();
    send({ vin: vin.trim().toUpperCase() });
  };
  const onYmm = (e: FormEvent) => {
    e.preventDefault();
    send({ year: Number(ymm.year), make: ymm.make.trim(), model: ymm.model.trim() });
  };

  if (found) {
    const name = `${found.year} ${titleCase(found.make)} ${found.model}${found.trim ? ` ${found.trim}` : ""}`;
    return (
      <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
        <SiteNav left={[]} right={[{ href: "/pricing", label: "Pricing" }]} />
        <div className="mx-auto max-w-[560px] pt-12 flex flex-col gap-6">
          <span className="type-label text-[12px] text-brand">We found your car</span>
          <h1 className={`${headline} text-ink text-[48px] leading-[0.92] md:text-[64px]`}>
            {name}. <span className="text-brand">This is it?</span>
          </h1>
          <dl className="flex flex-col">
            {[...(found.engine ? [["Engine", found.engine]] : []), ...Object.entries(found.specs).slice(0, 3), ["Open recalls", String(found.recalls.length)]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line py-3">
                <dt className="type-label text-[11px] text-ink-muted">{k}</dt>
                <dd className="type-data text-ink text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="type-caption text-ink-muted">From NHTSA. Your first lessons are already being written for this car.</p>
          <div className="flex flex-wrap items-center gap-8">
            <ArrowButton onClick={() => router.push("/app")}>Yes, that&apos;s my car</ArrowButton>
            <button type="button" onClick={() => setFound(null)} className="type-body text-ink-muted underline underline-offset-4 cursor-pointer">No, try again</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={[]} right={[{ href: "/pricing", label: "Pricing" }]} />
      <div className="mx-auto max-w-[560px] pt-12 flex flex-col gap-6">
      <h1 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>What do you <span className="text-brand">drive?</span></h1>
      <p className="type-body-lg text-ink-muted">Every lesson is written for your exact car. Find your 17-character VIN in one of these places:</p>
      <ul className="grid grid-cols-3 gap-2">
        {[
          { Icon: ScanLine, title: "Windshield", where: "Lower left corner, seen from outside" },
          { Icon: DoorOpen, title: "Door pillar", where: "Driver's door jamb sticker" },
          { Icon: FileText, title: "Insurance card", where: "Or your registration" },
        ].map(({ Icon, title, where }) => (
          <li key={title} className="flex flex-col gap-1.5 border border-line bg-surface p-3">
            <Icon size={22} className="text-brand" aria-hidden />
            <span className="type-body font-semibold text-ink leading-tight">{title}</span>
            <span className="type-caption text-ink-muted">{where}</span>
          </li>
        ))}
      </ul>

      <Card>
        <form onSubmit={onVin} className="flex flex-col gap-3">
          <label htmlFor="vin" className="type-label text-[12px]">VIN (17 characters)</label>
          <input id="vin" className={`${input} type-data uppercase`} value={vin} onChange={(e) => setVin(e.target.value)} maxLength={17} autoComplete="off" spellCheck={false} placeholder="1HGCV1F30JA000000" />
          <Button type="submit" full disabled={busy || vin.trim().length !== 17}>
            {busy && !showYmm ? "Looking up your car…" : "Find my car"}
          </Button>
        </form>
      </Card>

      {error && <p role="alert" className="type-body text-brake">{error}</p>}

      {showYmm ? (
        <Card>
          <form onSubmit={onYmm} className="flex flex-col gap-3">
            <h2 className="type-h3">Enter it by hand</h2>
            <label className="flex flex-col gap-1">
              <span className="type-label text-[12px]">Year</span>
              <input className={input} inputMode="numeric" value={ymm.year} onChange={(e) => setYmm({ ...ymm, year: e.target.value })} placeholder="2018" required pattern="(19[89]\d|20[0-3]\d)" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="type-label text-[12px]">Make</span>
              <input className={input} value={ymm.make} onChange={(e) => setYmm({ ...ymm, make: e.target.value })} placeholder="Honda" required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="type-label text-[12px]">Model</span>
              <input className={input} value={ymm.model} onChange={(e) => setYmm({ ...ymm, model: e.target.value })} placeholder="Civic" required />
            </label>
            <Button type="submit" full disabled={busy}>{busy ? "Saving…" : "Use this car"}</Button>
          </form>
        </Card>
      ) : (
        <button type="button" className="type-body text-brand underline self-start cursor-pointer" onClick={() => setShowYmm(true)}>
          No VIN handy? Enter year, make and model
        </button>
      )}
      </div>
    </main>
  );
}
