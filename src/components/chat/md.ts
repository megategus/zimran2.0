// Minimal markdown model for chat replies. No raw HTML is ever produced, so model output cannot inject markup.
export type Inline =
  | { t: "text"; v: string }
  | { t: "bold"; v: string }
  | { t: "code"; v: string }
  | { t: "link"; v: string; href: string };

export type Block =
  | { t: "p"; inl: Inline[] }
  | { t: "h"; inl: Inline[] }
  | { t: "ul" | "ol"; items: Inline[][] };

// Only same-site paths and https links become clickable; anything else stays plain text.
export function safeHref(href: string): string | null {
  if (/^\/(?!\/)[\w\-./?=&%#]*$/.test(href)) return href;
  if (/^https:\/\/[^\s"'<>]+$/i.test(href)) return href;
  return null;
}

const INLINE = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`/g;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of src.matchAll(INLINE)) {
    if (m.index > last) out.push({ t: "text", v: src.slice(last, m.index) });
    if (m[1] !== undefined) {
      const href = safeHref(m[2]);
      out.push(href ? { t: "link", v: m[1], href } : { t: "text", v: m[1] });
    } else if (m[3] !== undefined) out.push({ t: "bold", v: m[3] });
    else out.push({ t: "code", v: m[4] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ t: "text", v: src.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: "p", inl: parseInline(para.join(" ")) });
    para = [];
  };
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    const ul = /^[-*•]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) flush();
    else if (h) {
      flush();
      blocks.push({ t: "h", inl: parseInline(h[1]) });
    } else if (ul || ol) {
      flush();
      const t = ul ? "ul" : "ol";
      const prev = blocks[blocks.length - 1];
      const item = parseInline((ul ?? ol)![1]);
      if (prev && prev.t === t) prev.items.push(item);
      else blocks.push({ t, items: [item] });
    } else para.push(line);
  }
  flush();
  return blocks;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Client-side pre-check; the server validates again before any Claude call.
export function checkImage(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPEG, PNG or WebP photo.";
  if (file.size > MAX_IMAGE_BYTES) return "That photo is over 5 MB. Pick a smaller one.";
  return null;
}
