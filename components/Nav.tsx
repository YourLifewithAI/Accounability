import Link from "next/link";
import { MODULES } from "@/lib/module-registry";

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink">
          <span aria-hidden className="text-lg">⚖️</span>
          <span>Accountable</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {MODULES.map((m) => (
            <Link
              key={m.slug}
              href={m.href}
              className={`rounded-md px-3 py-1.5 font-medium transition hover:bg-slate-100 ${
                m.enabled ? "text-ink" : "text-slate-400"
              }`}
            >
              <span aria-hidden className="mr-1">{m.icon}</span>
              {m.title}
              {!m.enabled && (
                <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
                  soon
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
