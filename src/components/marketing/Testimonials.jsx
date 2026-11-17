import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useRef } from "react";
import { api } from "../../api/client";
import { Reveal } from "../Reveal";

const initials = (n = "") => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "H";
const AVATAR = ["bg-brand-100 text-brand-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700"];

/**
 * Real testimonials only: admin-curated (with consent) + verified 4–5★ booking reviews.
 * The section stays hidden until there is at least one — we never show made-up quotes.
 */
export default function Testimonials({ audience = "customer", eyebrow, title, subtitle, dark = false }) {
  const { data } = useQuery({
    queryKey: ["public-testimonials", audience],
    queryFn: () => api.get(`/public/testimonials/?audience=${audience}`).then((r) => r.data),
    staleTime: 600000,
  });
  const track = useRef(null);
  if (!data?.length) return null;
  const scroll = (dir) => track.current?.scrollBy({ left: dir * (track.current.clientWidth * 0.8), behavior: "smooth" });
  const avg = (data.reduce((s, t) => s + t.rating, 0) / data.length).toFixed(1);

  return (
    <section className={`py-20 ${dark ? "bg-slate-950 text-white" : "bg-gradient-to-b from-white to-brand-50/60"}`}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold uppercase tracking-wider ${dark ? "text-brand-200" : "text-brand-600"}`}>{eyebrow}</p>
              <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h2>
              {subtitle && <p className={`mt-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl px-4 py-2 text-center ${dark ? "bg-white/5" : "bg-white shadow-sm ring-1 ring-slate-200"}`}>
                <p className="flex items-center justify-center gap-1 text-2xl font-extrabold">{avg}<Star className="h-5 w-5 fill-accent-500 text-accent-500" /></p>
                <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{data.length} {data.length === 1 ? "story" : "stories"}</p>
              </div>
              <div className="hidden gap-2 sm:flex">
                {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([d, Icon, l]) => (
                  <button key={l} type="button" onClick={() => scroll(d)} aria-label={l}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${dark ? "border-white/20 hover:bg-white/10" : "border-slate-300 bg-white hover:border-brand-600 hover:text-brand-600"}`}>
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <div ref={track} className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((t, i) => (
            <figure key={t.id}
              className={`relative flex w-[85%] shrink-0 snap-start flex-col rounded-3xl p-7 sm:w-[46%] lg:w-[31.5%] ${dark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100"}`}>
              <Quote className={`absolute right-6 top-6 h-10 w-10 ${dark ? "text-white/10" : "text-brand-100"}`} />
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`h-4 w-4 ${k < t.rating ? "fill-accent-500 text-accent-500" : dark ? "text-white/20" : "text-slate-200"}`} />)}</div>
              <blockquote className={`mt-4 flex-1 text-[15px] leading-relaxed ${dark ? "text-slate-200" : "text-slate-700"}`}>“{t.quote}”</blockquote>
              <figcaption className={`mt-6 flex items-center gap-3 border-t pt-4 ${dark ? "border-white/10" : "border-slate-100"}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR[i % AVATAR.length]}`}>{initials(t.name)}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className={`truncate text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{[t.role, t.location].filter(Boolean).join(" · ")}</p>
                </div>
                {t.verified_booking && (
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified booking</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
