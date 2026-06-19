import Link from "next/link";
import { MODULES } from "@/lib/module-registry";
import { SearchBox } from "@/components/SearchBox";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-5 pt-6 text-center">
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Accountability you can share with a friend.
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-lg text-slate-600">
          Tools that make power legible — who funds your representatives, where
          your tax dollars go, and what&apos;s happening in your neighborhood.
          Every figure links back to its primary source.
        </p>
        <div className="mx-auto max-w-xl pt-2">
          <SearchBox autoFocus />
          <p className="mt-2 text-sm text-slate-500">
            Try{" "}
            <Link href="/money?q=warren" className="text-accent hover:underline">
              Warren
            </Link>
            ,{" "}
            <Link href="/money?q=cruz" className="text-accent hover:underline">
              Cruz
            </Link>
            , or{" "}
            <Link href="/money?q=TX" className="text-accent hover:underline">
              a state
            </Link>
            .
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {MODULES.map((m) => {
            const card = (
              <div
                className={`flex h-full flex-col rounded-xl border p-5 transition ${
                  m.enabled
                    ? "border-slate-200 bg-white hover:border-accent hover:shadow-md"
                    : "border-dashed border-slate-300 bg-slate-50"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span aria-hidden className="text-2xl">{m.icon}</span>
                  <h3 className="font-bold text-ink">{m.title}</h3>
                  {!m.enabled && (
                    <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{m.tagline}</p>
                {m.enabled && (
                  <span className="mt-4 text-sm font-semibold text-accent">
                    Open module →
                  </span>
                )}
              </div>
            );
            return m.enabled ? (
              <Link key={m.slug} href={m.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={m.slug}>{card}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
