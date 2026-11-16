import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, IndianRupee, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Empty, PageHeader, PageLoader } from "../../components/ui";
import { dateOnly, money } from "../../lib/format";

export function Offers() {
  const { data, isLoading } = useQuery({ queryKey: ["offers"], queryFn: () => api.get("/offers/").then((r) => r.data) });
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader title="Offers & coupons" subtitle="Apply the code at checkout" />
      {isLoading ? <PageLoader /> : !data.length ? <Empty title="No active offers right now" /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((o) => (
            <div key={o.id} className="card">
              <p className="text-lg font-bold">{o.title}</p>
              <p className="text-sm text-slate-600">{o.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                {o.service_name ? `Valid on ${o.service_name}` : "Valid on all services"}{Number(o.min_order_value) > 0 && ` · Min order ${money(o.min_order_value)}`} · Till {dateOnly(o.valid_to)}
                {o.first_booking_only && " · First booking only"}
              </p>
              <p className="mt-3 inline-block rounded border-2 border-dashed border-brand-600 px-3 py-1 font-mono font-bold text-brand-700">{o.code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">About Homigo</h1>
      <p className="mt-4 text-slate-600">
        Homigo is a door-to-door services marketplace. Every booking is handled by a verified local Area Partner and their team of
        background-checked professionals. We cover home repair, cleaning and domestic help, security, health at home, events, daily essentials and more.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Verified partners", "Business KYC, bank and licence checks before going live."],
          ["Verified professionals", "ID and police verification for every coworker."],
          ["Transparent pricing", "See the price before you book. Extra work needs your approval."],
          ["OTP-secured jobs", "Work starts and ends only with your OTP."],
        ].map(([t, d]) => (
          <div key={t} className="card"><p className="font-semibold">{t}</p><p className="text-sm text-slate-500">{d}</p></div>
        ))}
      </div>
    </div>
  );
}

export function PartnerJoin() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get("/plans/").then((r) => r.data) });
  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="max-w-2xl text-4xl font-bold">Grow your service business with Homigo</h1>
          <p className="mt-4 max-w-xl text-slate-300">Get bookings from customers near you, manage your team, rate card and earnings from one dashboard.</p>
          <Link to="/login?as=partner" className="btn mt-8 bg-accent-500 text-white hover:bg-accent-600">Register as partner</Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-4">
        {[[MapPin, "Customers near you", "We route nearby bookings to you."], [Users, "Manage your team", "Add coworkers, assign jobs, track work."], [BadgeCheck, "Verified badge", "Build trust with customers."], [IndianRupee, "Weekly payouts", "Clear earnings and settlements."]].map(([Icon, t, d]) => (
          <div key={t} className="card"><Icon className="h-6 w-6 text-brand-600" /><p className="mt-2 font-semibold">{t}</p><p className="text-sm text-slate-500">{d}</p></div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-bold">Subscription plans</h2>
        {plans.isLoading ? <PageLoader /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.data.map((p) => (
              <div key={p.id} className="card">
                <p className="text-lg font-bold">{p.name}</p>
                <p className="mt-2 text-3xl font-bold">{money(p.price)}<span className="text-sm font-normal text-slate-500"> / {p.duration_days} days</span></p>
                <p className="mt-1 text-sm text-slate-600">{Number(p.commission_percent)}% commission per completed booking</p>
                <ul className="mt-4 space-y-1 text-sm text-slate-600">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
