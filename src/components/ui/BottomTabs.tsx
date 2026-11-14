"use client";

import { Box, Camera, Map, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Today", Icon: Sun, match: (p: string) => p === "/app" },
  { href: "/app#courses", label: "Courses", Icon: Map, match: (p: string) => p.startsWith("/lesson") || p.startsWith("/course") },
  { href: "/chat", label: "Mechanic", Icon: Camera, match: (p: string) => p.startsWith("/chat") },
  { href: "/lab", label: "Lab", Icon: Box, match: (p: string) => p.startsWith("/lab") },
];

const APP_PATHS = ["/app", "/lesson", "/course", "/chat", "/lab"];

// Phone-only bottom tab bar on app pages (the top nav hides its left links on phones).
export function BottomTabs() {
  const path = usePathname();
  if (!APP_PATHS.some((p) => path.startsWith(p))) return null;
  return (
    <>
      <div aria-hidden className="h-16 md:hidden" />
      <nav aria-label="App" className="md:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 bg-plate text-on-plate border-t border-line pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon, match }) => {
          const on = match(path);
          return (
            <Link key={label} href={href} aria-current={on ? "page" : undefined} className={`flex flex-col items-center justify-center gap-1 h-16 type-label text-[10px] ${on ? "text-brand" : "opacity-75"}`}>
              <Icon size={20} aria-hidden />
              {label}
              <span className={`h-0.5 w-6 ${on ? "bg-brand" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
