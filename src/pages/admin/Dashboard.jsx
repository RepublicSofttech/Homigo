import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, BadgeCheck, IndianRupee, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Badge, PageHeader, PageLoader, StatCard } from "../../components/ui";
import { money } from "../../lib/format";

export default function AdminDashboard() {
  const { data: d, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => api.get("/admin/dashboard/").then((r) => r.data), refetchInterval: 30000 });
  if (isLoading) return <PageLoader />;
  const max = Math.max(1, ...d.last_7_days.map((x) => x.bookings));
  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Live business overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={IndianRupee} tone="green" label="GMV this month" value={money(d.gmv_month)} hint={`Commission ${money(d.commission_month)} · Subscriptions ${money(d.subscription_revenue_month)}`} />
        <StatCard icon={ShoppingBag} label="Bookings today" value={d.bookings_today} hint={`${d.live_jobs} live jobs`} />
        <StatCard icon={AlertTriangle} tone={d.sla_breaches ? "red" : "green"} label="Acceptance SLA breaches" value={d.sla_breaches} />
        <StatCard icon={BadgeCheck} tone="amber" label="Pending verifications" value={<Link to="/admin/verification" className="hover:underline">{d.pending_verifications}</Link>} />
        <StatCard icon={Users} label="Partners (approved / total)" value={`${d.partners.approved} / ${d.partners.total}`} hint={`${d.coworkers} coworkers`} />
        <StatCard icon={Activity} label="Customers" value={d.customers} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Bookings – last 7 days</h2>
          <div className="flex h-40 items-end gap-3">
            {d.last_7_days.map((x) => (
              <div key={x.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold">{x.bookings}</span>
                <div className="w-full rounded-t bg-brand-500" style={{ height: `${(x.bookings / max) * 100}%`, minHeight: 2 }} />
                <span className="text-[10px] text-slate-500">{x.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Bookings by status</h2>
          <div className="space-y-2">
            {Object.entries(d.bookings_by_status).map(([s, c]) => (
              <div key={s} className="flex items-center justify-between text-sm"><Badge status={s} /><b>{c}</b></div>
            ))}
            {!Object.keys(d.bookings_by_status).length && <p className="text-sm text-slate-500">No bookings yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
