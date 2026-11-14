"use client";

import { useEffect, useRef, useState } from "react";

// Cursor-following glow (from the button-2 snippet). Drop inside any `relative overflow-hidden` button or link:
// it listens to its parent, so the parent can stay a server component. Glow color comes from the parent's --glow.
// listen: how many levels up to attach the mouse listeners (2 = the link around a small icon square).
export function Spotlight({ listen = 1 }: { listen?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const box = ref.current?.parentElement;
    let el: HTMLElement | null | undefined = box;
    for (let i = 1; i < listen; i++) el = el?.parentElement;
    if (!box || !el) return;
    let focused = false;
    const move = (e: MouseEvent) => {
      if (focused) return;
      const r = box.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const show = () => setOpacity(1);
    const hide = () => !focused && setOpacity(0);
    const focus = () => {
      focused = true;
      setPos({ x: box.offsetWidth / 2, y: box.offsetHeight / 2 });
      setOpacity(1);
    };
    const blur = () => {
      focused = false;
      setOpacity(0);
    };
    const on: [string, EventListener][] = [["mousemove", move as EventListener], ["mouseenter", show], ["mouseleave", hide], ["focus", focus], ["blur", blur]];
    on.forEach(([t, f]) => el.addEventListener(t, f));
    return () => on.forEach(([t, f]) => el.removeEventListener(t, f));
  }, [listen]);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -inset-px transition-opacity duration-300 motion-reduce:transition-none"
      style={{ opacity, background: `radial-gradient(100px circle at ${pos.x}px ${pos.y}px, var(--glow), transparent)` }}
    />
  );
}
