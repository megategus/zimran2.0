import { Camera, Box } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CarCard } from "@/components/app/CarCard";
import type { NodeState } from "@/components/app/CourseNode";
import { CoursePath } from "@/components/app/CoursePath";
import { StreakBar } from "@/components/app/StreakBar";
import { Card, Tag } from "@/components/ui/primitives";
import { COURSES } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { peekGuest } from "@/lib/guest";
import { snapshot } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const guest = await peekGuest();
  if (!guest) redirect("/onboarding");
  const me = await snapshot(guest);
  if (!me.car) redirect("/onboarding");
  const done = new Set(me.progress.map((p) => p.lessonKey));

  const stateOf = (key: string): NodeState => (done.has(key) ? "done" : canAccess(guest, key) ? "current" : "locked");

  return (
    <main className="mx-auto max-w-[960px] px-4 py-6 md:py-10 flex flex-col gap-6">
      <StreakBar streak={me.streak} xp={me.xp} isPremium={guest.isPremium} isDemo={guest.isDemo} />
      <CarCard car={me.car} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href={guest.isPremium ? "/chat" : "/pricing"}>
          <Card className="flex items-center gap-3 h-full">
            <Camera className="text-brand" aria-hidden />
            <span className="flex flex-col">
              <span className="type-h3">AI Mechanic</span>
              <span className="type-caption text-ink-muted">Send a photo, get an answer for your {me.car.model}</span>
            </span>
            {!guest.isPremium && <span className="ml-auto"><Tag tone="plate">PRO</Tag></span>}
          </Card>
        </Link>
        <Link href={guest.isPremium ? "/lab" : "/pricing"}>
          <Card className="flex items-center gap-3 h-full">
            <Box className="text-brand" aria-hidden />
            <span className="flex flex-col">
              <span className="type-h3">3D Brake Lab</span>
              <span className="type-caption text-ink-muted">Take a brake apart and learn each part</span>
            </span>
            {!guest.isPremium && <span className="ml-auto"><Tag tone="plate">PRO</Tag></span>}
          </Card>
        </Link>
      </div>

      <h2 className="type-h1">Your courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURSES.map((c) => (
          <Card key={c.key} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="type-h2">{c.title}</h3>
              {c.status === "soon" && <Tag tone="muted">SOON</Tag>}
            </div>
            <CoursePath
              nodes={
                c.status === "live"
                  ? c.lessons.map((l) => {
                      const state = stateOf(l.key);
                      return { title: l.title, state, href: state === "locked" ? "/pricing" : `/lesson/${l.key}` };
                    })
                  : [{ title: c.outline?.[0] ?? c.title, state: "soon", href: `/course/${c.key}` }]
              }
            />
          </Card>
        ))}
      </div>
    </main>
  );
}
