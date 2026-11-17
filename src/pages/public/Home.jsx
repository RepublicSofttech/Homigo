import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, Clock, CreditCard, Gift, KeyRound, MapPin, Quote, ReceiptText,
  Search, ShieldCheck, Star, ThumbsUp, UserCheck, Wrench,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, listOf } from "../../api/client";
import { CountUp, Faq, Reveal } from "../../components/Reveal";
import { PageLoader } from "../../components/ui";
import { useLocation2 } from "../../context/LocationContext";
import { money, plural } from "../../lib/format";
import { iconFor } from "../../lib/icons";

export function ServiceCard({ s }) {
  const Icon = iconFor(s.icon || s.category_icon);
  return (
    <Link to={`/services/${s.id}`} className="card group flex h-full flex-col gap-3 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="font-semibold text-slate-900 group-hover:text-brand-700">{s.name}</p>
        <p className="text-xs text-slate-500">{s.category_name}</p>
      </div>
      {s.starting_price && <p className="mt-auto text-sm text-slate-600">Starts at <b>{money(s.starting_price)}</b></p>}
    </Link>
  );
}

const QUICK_SEARCHES = ["Tap leak", "AC service", "Deep cleaning", "Maid", "Electrician"];

const STEPS = [
  [Search, "Pick a service", "Search or browse, see the price upfront and choose a time slot that suits you."],
  [UserCheck, "We match a verified pro", "The nearest verified partner accepts your job — or choose a provider yourself."],
  [KeyRound, "Work starts with your OTP", "Share the start OTP only when the pro is at your door. Extra work needs your approval."],
  [ThumbsUp, "Pay & rate", "Pay online or after service. Rate the job and add a tip if you loved it."],
];

const WHY = [
  [ShieldCheck, "Verified professionals", "Every partner passes business KYC. Every pro is ID-verified before their first job."],
  [ReceiptText, "Upfront, fair pricing", "See the full price before you book. No surprise charges — extra work needs your OK."],
  [KeyRound, "OTP-secured visits", "Jobs start and finish only with your OTP, so you always stay in control."],
  [BadgeCheck, "Service warranty", "Something not right? Many services come with a warranty — we'll make it right."],
  [CreditCard, "Pay your way", "Pay after the service in cash or UPI, or pay online securely."],
  [Wrench, "Pro brings the kit", "For many services the pro brings their own tools and supplies — just book and relax."],
];

const FAQ = [
  ["How are professionals verified?", "Every Area Partner goes through business KYC, bank and document checks before going live. Each professional on their team is ID-verified and approved before they can take a job."],
  ["Can I choose my own professional?", "Yes. Either let us send the nearest available pro, or pick a specific provider from the list on the service page — you'll see their rating and distance."],
  ["What if the job needs extra work?", "The pro adds the extra work in the app with the price. Nothing is charged unless you approve it."],
  ["How do I pay?", "Choose “Pay after service” (cash or UPI) or pay online at booking. You'll get a clear bill with every item."],
  ["Can I cancel or reschedule?", "Yes, from My Bookings. Cancelling well before the slot is free; a small fee may apply close to the visit time. You'll always see the fee before you confirm."],
  ["Is my address safe?", "Your exact address is shared only with the partner who accepts your job, and only for that booking."],
];

function SectionTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Real numbers only (from /public/stats/). Each stat appears once it crosses a meaningful threshold;
 *  the whole band stays hidden until at least 3 qualify, so a new platform never shows weak numbers. */
function StatsBand() {
  const { data } = useQuery({ queryKey: ["public-stats"], queryFn: () => api.get("/public/stats/").then((r) => r.data), staleTime: 600000 });
  if (!data) return null;
  const items = [
    data.bookings_completed >= 100 && { value: data.bookings_completed, suffix: "+", label: "Jobs completed" },
    data.verified_professionals >= 25 && { value: data.verified_professionals, label: "Verified professionals" },
    data.services >= 10 && { value: data.services, label: "Services" },
    data.cities >= 3 && { value: data.cities, label: data.cities === 1 ? "City live" : "Cities live" },
    data.average_rating && data.reviews_count >= 20 && { value: data.average_rating, label: `Average rating · ${data.reviews_count} reviews`, rating: true },
  ].filter(Boolean);
  if (items.length < 3) return null;
  return (
    <section className="bg-slate-950 py-14 text-white">
      <div className={`mx-auto grid max-w-6xl gap-8 px-4 text-center sm:grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {items.slice(0, 4).map((s) => (
          <Reveal key={s.label}>
            <p className="text-4xl font-extrabold text-white sm:text-5xl">
              {s.rating ? <>{s.value}<Star className="ml-1 inline h-8 w-8 fill-accent-500 text-accent-500" /></> : <CountUp value={s.value} suffix={s.suffix || ""} />}
            </p>
            <p className="mt-2 text-sm text-slate-400">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const { data } = useQuery({ queryKey: ["public-reviews"], queryFn: () => api.get("/public/reviews/").then((r) => r.data), staleTime: 600000 });
  if (!data?.length) return null;
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal><SectionTitle eyebrow="Reviews" title="What customers say" subtitle="Real reviews from completed bookings." /></Reveal>
        <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4">
          {data.map((r) => (
            <figure key={r.id} className="flex w-80 shrink-0 snap-start flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <Quote className="h-6 w-6 text-brand-200" />
              <div className="mt-2 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-accent-500 text-accent-500" : "text-slate-200"}`} />)}</div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">“{r.comment}”</blockquote>
              <figcaption className="mt-4 border-t border-slate-100 pt-3 text-sm">
                <p className="font-semibold text-slate-900">{r.customer}</p>
                <p className="text-xs text-slate-500">{r.service} · {r.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { location } = useLocation2();
  const [q, setQ] = useState("");
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api.get("/categories/").then((r) => r.data) });
  const services = useQuery({ queryKey: ["services", "home"], queryFn: () => api.get("/services/?page_size=8").then((r) => listOf(r.data)) });
  const offers = useQuery({ queryKey: ["offers"], queryFn: () => api.get("/offers/").then((r) => r.data) });
  const search = (term) => nav(`/services?q=${encodeURIComponent(term)}`);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.18),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-5">
          <Reveal className="min-w-0 lg:col-span-3">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-brand-100">
              <MapPin className="h-3.5 w-3.5" /> Serving {location.name}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Trusted home services,<br className="hidden sm:block" /> <span className="text-accent-500">at your doorstep.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">Verified plumbers, electricians, cleaners, maids, guards and more — from the nearest partner in your area.</p>
            <form onSubmit={(e) => { e.preventDefault(); search(q); }} className="mt-8 flex max-w-xl overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl">
              <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-slate-400" />
              <input className="min-w-0 flex-1 px-3 py-2.5 text-slate-800 outline-none" placeholder='Try "tap leak", "AC service", "maid"' value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" />
              <button className="shrink-0 rounded-xl bg-accent-500 px-5 font-semibold text-white hover:bg-accent-600 sm:px-7">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((t) => (
                <button key={t} type="button" onClick={() => search(t)} className="rounded-full border border-white/20 px-3 py-1 text-sm text-brand-100 transition hover:bg-white/10">{t}</button>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified professionals</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-300" /> Same-day slots</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" /> Service warranty</span>
            </div>
          </Reveal>
          <Reveal delay={150} className="hidden lg:col-span-2 lg:block">
            <div className="relative mx-auto max-w-xs">
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Pro on the way</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">RK</span>
                  <div>
                    <p className="font-semibold">Rakesh · Plumber</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><Star className="h-3 w-3 fill-accent-500 text-accent-500" /> 4.8 · ID verified</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {[["Booking confirmed", true], ["Pro assigned", true], ["On the way", true], ["Start with OTP", false]].map(([t, done]) => (
                    <p key={t} className={`flex items-center gap-2 ${done ? "text-slate-700" : "text-slate-400"}`}>
                      <CheckCircle2 className={`h-4 w-4 ${done ? "text-emerald-500" : "text-slate-300"}`} />{t}
                    </p>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm">Your start OTP <b className="ml-1 tracking-widest">4 8 2 1</b></div>
              </div>
              <p className="mt-4 text-center text-xs text-brand-200">Sample screen for illustration</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal><SectionTitle eyebrow="Categories" title="What do you need help with?" /></Reveal>
        {cats.isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(cats.data || []).map((c, i) => {
              const Icon = iconFor(c.icon);
              return (
                <Reveal key={c.id} delay={i * 50}>
                  <Link to={`/services?category=${c.id}`} className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
                    <div className="rounded-2xl bg-brand-50 p-3.5 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon className="h-6 w-6" /></div>
                    <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="text-xs text-slate-400">{plural(c.service_count, "service")}</span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal><SectionTitle eyebrow="How it works" title="Book in minutes. Relax while we handle the rest." action={<Link to="/how-it-works" className="text-sm font-semibold text-brand-600 hover:text-brand-700">See full process →</Link>} /></Reveal>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={i * 90}>
                <li className="relative h-full list-none rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <span className="absolute right-5 top-4 text-5xl font-extrabold text-slate-100">{i + 1}</span>
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white"><Icon className="h-5 w-5" /></span>
                  <p className="relative mt-4 font-semibold text-slate-900">{t}</p>
                  <p className="relative mt-1 text-sm text-slate-600">{d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal><SectionTitle eyebrow="Popular" title="Most booked services" action={<Link to="/services" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>} /></Reveal>
        {services.isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(services.data || []).map((s, i) => <Reveal key={s.id} delay={i * 50}><ServiceCard s={s} /></Reveal>)}
          </div>
        )}
      </section>

      {/* Offers */}
      {offers.data?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <Reveal><SectionTitle eyebrow="Save more" title="Offers for you" action={<Link to="/offers" className="text-sm font-semibold text-brand-600 hover:text-brand-700">All offers →</Link>} /></Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.data.slice(0, 3).map((o, i) => (
              <Reveal key={o.id} delay={i * 80}>
                <div className="relative h-full overflow-hidden rounded-2xl p-6 text-white shadow-lg" style={{ background: o.banner_color || "#4F46E5" }}>
                  <Gift className="absolute -right-3 -top-3 h-20 w-20 opacity-15" />
                  <p className="text-lg font-bold">{o.title}</p>
                  <p className="mt-1 text-sm opacity-90">{o.description || (o.service_name ? `On ${o.service_name}` : "On all services")}</p>
                  <p className="mt-4 inline-block rounded-lg border border-dashed border-white/70 px-3 py-1 font-mono text-sm">{o.code}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Why Homigo */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal><SectionTitle eyebrow="Why Homigo" title="Peace of mind, built into every booking" /></Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="flex h-full gap-4 rounded-2xl border border-slate-200 p-6 transition hover:border-brand-200 hover:shadow-md">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold text-slate-900">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />
      <Testimonials />

      {/* FAQ */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-3">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">FAQ</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Questions? We've got answers.</h2>
          <p className="mt-3 text-slate-600">Still need help? Our support team is a message away.</p>
          <Link to="/support" className="btn mt-5 border border-slate-300 text-slate-700 hover:bg-slate-50">Contact support</Link>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-2"><Faq items={FAQ} /></Reveal>
      </section>

      {/* Dual CTA */}
      <section className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
            <div>
              <CalendarCheck className="h-8 w-8 text-accent-500" />
              <h3 className="mt-3 text-2xl font-bold">Need something fixed?</h3>
              <p className="mt-1 text-brand-100">Book a verified pro in under 2 minutes.</p>
            </div>
            <Link to="/services" className="btn mt-6 w-fit bg-white text-brand-700 hover:bg-brand-50">Book a service <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex h-full flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white">
            <div>
              <Star className="h-8 w-8 text-accent-500" />
              <h3 className="mt-3 text-2xl font-bold">Run a service business?</h3>
              <p className="mt-1 text-slate-300">Get bookings near you and manage your team in one app.</p>
            </div>
            <Link to="/partner/join" className="btn mt-6 w-fit bg-accent-500 text-white hover:bg-accent-600">Become a partner <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
