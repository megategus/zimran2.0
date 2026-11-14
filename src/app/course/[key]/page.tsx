import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Tag } from "@/components/ui/primitives";
import { COURSES } from "@/content/catalog";
import { NotifyButton } from "./NotifyButton";

export default async function CoursePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const course = COURSES.find((c) => c.key === key);
  if (!course) notFound();
  if (course.status === "live") redirect("/app");

  return (
    <main className="mx-auto max-w-[640px] px-4 py-10 flex flex-col gap-6">
      <div><Tag tone="muted">COMING SOON</Tag></div>
      <h1 className="type-h1">{course.title}</h1>
      <Card className="flex flex-col gap-3">
        <h2 className="type-h3">What you will learn</h2>
        <ol className="flex flex-col gap-2 list-decimal pl-5 type-body-lg">
          {course.outline?.map((o) => <li key={o}>{o}</li>)}
        </ol>
      </Card>
      <NotifyButton courseKey={course.key} />
      <ButtonLink href="/app" variant="secondary">Back to my courses</ButtonLink>
    </main>
  );
}
