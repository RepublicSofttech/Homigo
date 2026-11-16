import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import PayModal from "../../components/PayModal";
import { Badge, DataTable, PageHeader, PageLoader } from "../../components/ui";
import { dateOnly, money } from "../../lib/format";

export default function Subscription() {
  const qc = useQueryClient();
  const [pay, setPay] = useState(null);
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get("/plans/").then((r) => r.data) });
  const current = useQuery({ queryKey: ["sub-current"], queryFn: () => api.get("/partner/subscriptions/current/").then((r) => r.data) });
  const history = useQuery({ queryKey: ["sub-history"], queryFn: () => api.get("/partner/subscriptions/").then((r) => r.data) });
  const refresh = () => ["sub-current", "sub-history", "partner-dashboard"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const subscribe = useMutation({
    mutationFn: (plan) => api.post("/partner/subscriptions/", { plan }).then((r) => r.data),
    onSuccess: (s) => setPay(s),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const cancel = useMutation({
    mutationFn: (id) => api.post(`/partner/subscriptions/${id}/cancel/`),
    onSuccess: () => { toast.success("Auto-renew cancelled. Plan stays active till end date."); refresh(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (plans.isLoading || current.isLoading) return <PageLoader />;
  const c = current.data;
  return (
    <div>
      <PageHeader title="Subscription" subtitle="An active plan is required to appear to customers" />
      <div className="card mb-6">
        {c ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Current plan</p>
              <p className="text-xl font-bold">{c.plan_detail.name} <Badge status={c.in_grace ? "pending" : c.status} >{c.in_grace ? "Grace period" : c.status}</Badge></p>
              <p className="text-sm">{dateOnly(c.start_date)} – {dateOnly(c.end_date)} · {c.days_left} days left · {Number(c.plan_detail.commission_percent)}% commission</p>
            </div>
            {c.status === "active" && <button className="btn-secondary" onClick={() => window.confirm("Cancel this plan? It stays active till the end date.") && cancel.mutate(c.id)}>Cancel plan</button>}
          </div>
        ) : <p className="font-semibold text-red-600">No active subscription. Choose a plan below.</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.data.map((p) => (
          <div key={p.id} className={`card flex flex-col ${c?.plan === p.id ? "ring-2 ring-brand-600" : ""}`}>
            <p className="text-lg font-bold">{p.name}</p>
            <p className="mt-1 text-3xl font-bold">{money(p.price)}<span className="text-sm font-normal text-slate-500"> / {p.duration_days} days</span></p>
            <p className="text-sm text-slate-600">{Number(p.commission_percent)}% commission · {p.max_coworkers ? `${p.max_coworkers} coworkers` : "Unlimited coworkers"}</p>
            <ul className="my-4 flex-1 space-y-1 text-sm text-slate-600">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <button className="btn-primary" onClick={() => subscribe.mutate(p.id)} disabled={subscribe.isPending}>{c ? "Renew / switch" : "Subscribe"}</button>
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-semibold">History</h2>
      <DataTable rows={history.data || []} columns={[
        { key: "invoice_no", label: "Invoice" }, { key: "plan", label: "Plan", render: (s) => s.plan_detail.name },
        { key: "amount", label: "Amount", render: (s) => money(s.amount) }, { key: "start_date", label: "From", render: (s) => dateOnly(s.start_date) },
        { key: "end_date", label: "To", render: (s) => dateOnly(s.end_date) }, { key: "status", label: "Status", render: (s) => <Badge status={s.status} /> },
      ]} />
      {pay && <PayModal open purpose="subscription" refId={pay.id} amount={pay.amount} onClose={() => { setPay(null); refresh(); }} onPaid={refresh} />}
    </div>
  );
}
