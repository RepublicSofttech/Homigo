import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api/client";
import PayModal from "../../components/PayModal";
import { Badge, DataTable, PageHeader, PageLoader, StatCard, Tabs } from "../../components/ui";
import { dateTime, money } from "../../lib/format";

export default function Earnings() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("commissions");
  const [topup, setTopup] = useState(false);
  const { data: d, isLoading } = useQuery({ queryKey: ["earnings"], queryFn: () => api.get("/partner/earnings/").then((r) => r.data) });
  if (isLoading) return <PageLoader />;
  const bal = Number(d.wallet.balance);
  return (
    <div>
      <PageHeader title="Earnings & wallet" actions={bal < 0 && <button className="btn-primary" onClick={() => setTopup(true)}>Pay dues {money(-bal)}</button>} />
      {bal < 0 && -bal > Number(d.cash_limit) && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Commission dues are above the cash limit ({money(d.cash_limit)}). Please clear dues to keep receiving cash bookings.</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={money(bal)} tone={bal < 0 ? "red" : "green"} hint={bal < 0 ? "You owe commission on cash jobs" : "Will be settled weekly"} />
        <StatCard label="Gross service value" value={money(d.totals.gross)} />
        <StatCard label="Platform commission + GST" value={money(Number(d.totals.commission) + Number(d.totals.gst))} tone="amber" />
        <StatCard label="Your net earnings" value={money(d.totals.net)} tone="green" />
      </div>
      <Tabs tabs={["commissions", "transactions", "settlements"]} value={tab} onChange={setTab} />
      {tab === "commissions" && <DataTable rows={d.commissions} columns={[
        { key: "booking_no", label: "Booking" }, { key: "payment_mode", label: "Mode" }, { key: "service_value", label: "Service value", render: (r) => money(r.service_value) },
        { key: "commission_percent", label: "%", render: (r) => `${r.commission_percent}%` }, { key: "commission_amount", label: "Commission", render: (r) => money(r.commission_amount) },
        { key: "gst_on_commission", label: "GST", render: (r) => money(r.gst_on_commission) }, { key: "partner_net", label: "Net", render: (r) => money(r.partner_net) },
      ]} />}
      {tab === "transactions" && <DataTable rows={d.transactions} columns={[
        { key: "created_at", label: "Date", render: (r) => dateTime(r.created_at) }, { key: "description", label: "Description" },
        { key: "amount", label: "Amount", render: (r) => <span className={Number(r.amount) < 0 ? "text-red-600" : "text-emerald-700"}>{money(r.amount)}</span> },
        { key: "balance_after", label: "Balance", render: (r) => money(r.balance_after) },
      ]} />}
      {tab === "settlements" && <DataTable rows={d.settlements} columns={[
        { key: "created_at", label: "Date", render: (r) => dateTime(r.created_at) }, { key: "amount", label: "Amount", render: (r) => money(r.amount) },
        { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "utr", label: "UTR" },
      ]} />}
      {topup && <PayModal open purpose="wallet_topup" amount={-bal} onClose={() => setTopup(false)} onPaid={() => qc.invalidateQueries({ queryKey: ["earnings"] })} />}
    </div>
  );
}
