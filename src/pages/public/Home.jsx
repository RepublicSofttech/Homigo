import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Clock, Search, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, listOf } from "../../api/client";
import { useLocation2 } from "../../context/LocationContext";
import { iconFor } from "../../lib/icons";
import { money } from "../../lib/format";
import { PageLoader } from "../../components/ui";

export function ServiceCard({ s }) {
  const Icon = iconFor(s.icon || s.category_icon);
  return (
    <Link to={`/services/${s.id}`} className="card group flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="font-semibold text-slate-900 group-hover:text-brand-700">{s.name}</p>
        <p className="text-xs text-slate-500">{s.category_name}</p>
      </div>
      {s.starting_price && <p className="mt-auto text-sm text-slate-600">Starts at <b>{money(s.starting_price)}</b></p>}
    </Link>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { location } = useLocation2();
  const [q, setQ] = useState("");
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api.get("/categories/").then((r) => r.data) });
  const services = useQuery({ queryKey: ["services", "home"], queryFn: () => api.get("/services/?page_size=8").then((r) => listOf(r.data)) });
  const offers = useQuery({ queryKey: ["offers"], queryFn: () => api.get("/offers/").then((r) => r.data) });

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="mb-2 text-sm font-medium text-brand-100">Serving {location.name}</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">Trusted home services, at your doorstep.</h1>
          <p className="mt-4 max-w-xl text-brand-100">Verified plumbers, electricians, cleaners, maids, guards and more — from the nearest partner in your area.</p>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/services?q=${encodeURIComponent(q)}`); }} className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-lg">
            <Search className="ml-4 mt-3.5 h-5 w-5 shrink-0 text-slate-400" />
            <input className="min-w-0 flex-1 px-3 py-3 text-slate-800 outline-none" placeholder='Try "tap leak", "AC service", "maid"' value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="shrink-0 bg-accent-500 px-4 font-semibold sm:px-6 text-white hover:bg-accent-600">Search</button>
          </form>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-brand-100">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Police-verified professionals</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Same-day slots</span>
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Service warranty</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Categories</h2>
        {cats.isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(cats.data || []).map((c) => {
              const Icon = iconFor(c.icon);
              return (
                <Link key={c.id} to={`/services?category=${c.id}`} className="card flex flex-col items-center gap-2 text-center hover:shadow-md">
                  <div className="rounded-full bg-brand-50 p-3 text-brand-600"><Icon className="h-6 w-6" /></div>
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-slate-400">{c.service_count} services</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {offers.data?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold">Offers for you</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.data.slice(0, 3).map((o) => (
              <div key={o.id} className="rounded-xl p-5 text-white shadow" style={{ background: o.banner_color || "#4F46E5" }}>
                <p className="text-lg font-bold">{o.title}</p>
                <p className="mt-1 text-sm opacity-90">{o.description || (o.service_name ? `On ${o.service_name}` : "On all services")}</p>
                <p className="mt-4 inline-block rounded border border-dashed border-white/70 px-3 py-1 font-mono text-sm">{o.code}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Popular services</h2>
          <Link to="/services" className="text-sm font-medium text-brand-600">View all</Link>
        </div>
        {services.isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(services.data || []).map((s) => <ServiceCard key={s.id} s={s} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3">
          {[
            ["1", "Choose a service", "Pick what you need and see the nearest verified partner."],
            ["2", "Book a slot", "Select a time, pay online or after service."],
            ["3", "Relax", "Track your professional, share OTP to start, rate after the job."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{n}</span>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="text-sm text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-900 p-8 text-white sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm text-accent-500"><Star className="h-4 w-4" /> For service businesses</p>
            <h3 className="mt-1 text-2xl font-bold">Become an Area Partner</h3>
            <p className="text-slate-300">Get bookings in your area, manage your team and earnings in one place.</p>
          </div>
          <Link to="/partner/join" className="btn bg-white text-slate-900 hover:bg-slate-100">Join now</Link>
        </div>
      </section>
    </div>
  );
}
