"use client";

import { ImagePlus, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/primitives";
import { headline, SiteNav } from "@/components/ui/site";
import type { Car } from "@/lib/types";
import { Markdown } from "./Markdown";
import { IMAGE_TYPES, checkImage } from "./md";

type Msg = { role: "user" | "assistant"; content: string; hadImage?: boolean };
type ApiMsg = { role: string; content: string; had_image?: boolean; hadImage?: boolean };

const STARTERS = ["Is this tire wear normal?", "What's this warning light?", "Quote says $640 for front brakes — fair?"];

export function ChatView() {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const me = await fetch("/api/me").then((r) => (r.ok ? r.json() : null));
        if (off) return;
        if (!me?.car) return router.replace("/onboarding");
        if (!me.guest?.isPremium) return router.replace("/pricing");
        setCar(me.car);
        const hist = await fetch("/api/chat");
        if (off) return;
        if (hist.status === 402) return router.replace("/pricing");
        if (hist.ok) {
          const data = await hist.json();
          setMessages(((data.messages ?? []) as ApiMsg[]).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user", content: m.content, hadImage: m.had_image ?? m.hadImage,
          })));
        }
        setReady(true);
      } catch {
        if (!off) { setError("Couldn't load the chat. Reload the page."); setReady(true); }
      }
    })();
    return () => { off = true; };
  }, [router]);

  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function pick(file: File | undefined) {
    if (!file) return;
    const problem = checkImage(file);
    setError(problem);
    setImage(problem ? null : file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    const body = new FormData();
    body.set("message", message);
    if (image) body.set("image", image);
    const before = messages;
    setMessages([...before, { role: "user", content: message, hadImage: !!image }, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", { method: "POST", body });
      if (res.status === 402) return router.replace("/pricing");
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(typeof data?.error === "string" ? data.error : "The mechanic didn't answer. Try again.");
      }
      setText("");
      setImage(null);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += dec.decode(value, { stream: true });
        const snapshot = reply;
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: snapshot }]);
      }
      if (!reply.trim()) throw new Error("The mechanic didn't answer. Try again.");
    } catch (err) {
      // Keep whatever streamed; drop the empty placeholder and the unsent question.
      setMessages((m) => (m[m.length - 1]?.content ? m : before));
      setError(err instanceof Error && err.message ? err.message : "The mechanic didn't answer. Try again.");
    } finally {
      setSending(false);
    }
  }

  const carName = car ? `${car.year} ${car.make} ${car.model}` : "";

  return (
    <main className="mx-auto max-w-[1120px] min-h-dvh flex flex-col px-4 md:px-10">
      <SiteNav left={[{ href: "/app", label: "My courses" }]} right={[{ href: "/lab", label: "3D Lab" }]} />
      <div className="mx-auto w-full max-w-[720px] flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-bg py-4 flex items-center justify-between gap-3 border-b border-line">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`${headline} text-ink text-[36px] leading-none`}>AI <span className="text-brand">Mechanic</span></h1>
            <Tag tone="plate">Pro</Tag>
          </div>
          <p className="type-data text-ink-muted truncate">{carName || "Loading your car…"}{car?.engine ? ` · ${car.engine}` : ""}</p>
        </div>
      </header>

      <div className="flex-1 py-4 flex flex-col gap-3" aria-live="polite">
        {ready && messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="type-body-lg">Ask anything about your {carName}. Add a photo of a tire, a warning light or a repair quote.</p>
            <div className="flex flex-col items-start gap-2">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => setText(s)} className="text-left rounded-md border border-line-strong bg-surface px-4 py-3 cursor-pointer hover:bg-surface-sunken">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[88%] rounded-lg px-4 py-3 type-body-lg ${m.role === "user" ? "self-end bg-brand-soft" : "self-start bg-surface border border-line"}`}>
            {m.hadImage && <p className="type-caption text-ink-muted">Photo attached</p>}
            {m.role === "user" ? <p className="whitespace-pre-wrap break-words">{m.content}</p> : m.content ? <Markdown text={m.content} /> : <p className="text-ink-muted">Looking at your {car?.model ?? "car"}…</p>}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-16 md:bottom-0 bg-bg py-3 flex flex-col gap-2 border-t border-line">
        {error && <p role="alert" className="type-caption text-brake">{error}</p>}
        {preview && (
          <div className="relative self-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, never uploaded to storage */}
            <img src={preview} alt="Photo to send" className="h-20 w-20 rounded-md object-cover border border-line" />
            <button type="button" onClick={() => setImage(null)} aria-label="Remove photo" className="absolute -top-2 -right-2 rounded-pill bg-plate text-on-plate p-1 cursor-pointer">
              <X size={16} aria-hidden />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
          <Button type="button" variant="secondary" className="px-3.5!" aria-label="Add a photo" onClick={() => fileRef.current?.click()} disabled={!ready || sending}>
            <ImagePlus size={20} aria-hidden />
          </Button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            rows={1}
            maxLength={2000}
            aria-label="Message"
            placeholder="Ask about your car"
            className="flex-1 min-h-12 max-h-40 resize-y rounded-sm border-2 border-line-strong bg-surface px-3 py-2.5"
          />
          <Button type="submit" className="px-3.5!" aria-label="Send" disabled={!ready || sending || !text.trim()}>
            <Send size={20} aria-hidden />
          </Button>
        </div>
        <p className="type-caption text-ink-muted">Photos up to 5 MB, JPEG, PNG or WebP. Not stored. AI advice can be wrong: when in doubt, see a pro.</p>
      </form>
      </div>
    </main>
  );
}
