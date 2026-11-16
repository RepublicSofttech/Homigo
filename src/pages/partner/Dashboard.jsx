import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarCheck, Clock, IndianRupee, Star, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorCode } from "../../api/client";
import { Badge, DataTable, PageHeader, PageLoader, StatCard } from "../../components/ui";
import { dateTime, money } from "../../lib/format";

export default function PartnerDashboard() {
  const nav = useNavigate();
  const { data: d, isLoading, error } = useQuery({ queryKey: ["partner-dashboard"], queryFn: () => api.get("/partner/dashboard/").then((r) => r.data), refetchInterval: 30000, retry: false });
  if (isLoading) return <PageLoader />;
  if (errorCode(error) === "PARTNER_PROFILE_MISSING") {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold">Welcome to Homigo!</h2>
        <p className="mt-2 text-slate-500">Complete your business profile to start receiving bookings.</p>
        <Link to="/partner/onboarding" className="btn-primary mt-4">Start onboarding</Link>
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={`Hello, ${d.partner.display_name}`} subtitle={<span className="flex items-center gap-2">Status: <Badge status={d.partner.is_live ? "active" : "inactive"}>{d.partner.is_live ? "Live for customers" : "Not live yet"}</Badge> <Badge status={d.partner.verification_status} /></span>} />
      {d.alerts.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-amber-900"><AlertTriangle className="h-4 w-4" /> Complete these to go live</p>
          <ul className="list-inside list-disc text-sm text-amber-800">{d.alerts.map((a) => <li key={a}>{a}</li>)}</ul>
          <Link to="/partner/onboarding" className="mt-2 inline-block text-sm font-semibold text-brand-700">Go to onboarding →</Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Clock} tone="amber" label="Pending acceptance" value={d.pending_acceptance} hint="Accept within SLA" />
        <StatCard icon={CalendarCheck} label="Today's jobs" value={d.today_jobs} hint={`${d.in_progress} in progress`} />
        <StatCard icon={IndianRupee} tone="green" label="Earnings this month" value={money(d.earnings_month)} hint={`Today ${money(d.earnings_today)}`} />
        <StatCard icon={Wallet} tone={Number(d.wallet_balance) < 0 ? "red" : "green"} label="Wallet balance" value={money(d.wallet_balance)} hint={Number(d.wallet_balance) < 0 ? "Commission due on cash jobs" : "Pending settlement"} />
        <StatCard icon={Star} label="Rating" value={Number(d.partner.rating).toFixed(1)} hint={`${d.partner.rating_count} reviews`} />
        <StatCard icon={CalendarCheck} label="Completed this month" value={d.completed_month} hint={`${d.cancelled_month} cancelled`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Recent bookings</h2>
          <DataTable rows={d.recent} onRowClick={(b) => nav(`/partner/bookings/${b.id}`)} columns={[
            { key: "booking_no", label: "Booking" }, { key: "service_name", label: "Service" },
            { key: "scheduled_start", label: "When", render: (b) => dateTime(b.scheduled_start) },
            { key: "status", label: "Status", render: (b) => <Badge status={b.status} /> },
          ]} />
        </div>
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-slate-500">Subscription</p>
            {d.subscription ? (
              <>
                <p className="text-lg font-bold">{d.subscription.plan}</p>
                <p className="text-sm">Valid till {d.subscription.end_date} ({d.subscription.days_left} days left)</p>
                {d.subscription.in_grace && <p className="text-sm font-semibold text-red-600">In grace period — renew now</p>}
              </>
            ) : <p className="font-semibold text-red-600">No active plan</p>}
            <Link to="/partner/subscription" className="mt-2 inline-block text-sm text-brand-600">Manage plan →</Link>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Team</p>
            <p className="text-lg font-bold">{d.coworkers.approved} / {d.coworkers.total} active & approved</p>
            <Link to="/partner/team" className="mt-2 inline-block text-sm text-brand-600">Manage team →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
