import { useQuery } from "@tanstack/react-query";
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
