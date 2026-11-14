import Link from "next/link";
import { type Inline, parseMarkdown } from "./md";

function Inl({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.t === "bold") return <strong key={i} className="font-semibold">{n.v}</strong>;
        if (n.t === "code") return <code key={i} className="type-data">{n.v}</code>;
        if (n.t === "link") {
          const cls = "font-semibold underline underline-offset-2";
          return n.href.startsWith("/")
            ? <Link key={i} href={n.href} className={cls}>{n.v}</Link>
            : <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" className={cls}>{n.v}</a>;
        }
        return <span key={i}>{n.v}</span>;
      })}
    </>
  );
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 break-words">
      {parseMarkdown(text).map((b, i) => {
        if (b.t === "p") return <p key={i}><Inl nodes={b.inl} /></p>;
        if (b.t === "h") return <p key={i} className="type-h3"><Inl nodes={b.inl} /></p>;
        const List = b.t;
        return (
          <List key={i} className={`pl-5 flex flex-col gap-1 ${b.t === "ul" ? "list-disc" : "list-decimal"}`}>
            {b.items.map((it, j) => <li key={j}><Inl nodes={it} /></li>)}
          </List>
        );
      })}
    </div>
  );
}
