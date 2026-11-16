import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Badge, Empty, PageHeader, PageLoader, Tabs } from "../../components/ui";
import { dateTime, money, plural } from "../../lib/format";

export default function Jobs() {
  const [tab, setTab] = useState("today");
  const { data, isLoading } = useQuery({ queryKey: ["coworker-jobs"], queryFn: () => api.get("/coworker/jobs/").then((r) => r.data), refetchInterval: 20000 });
  if (isLoading) return <PageLoader />;
  const prof = data.profile[0];
  return (
    <div>
      <PageHeader title="My jobs" subtitle={prof ? `${prof.partner} · ★ ${Number(prof.rating).toFixed(1)} · ${plural(prof.jobs_completed, "job")} done · Tips ${money(prof.tips_total)}` : "Not linked to a partner yet"} />
      {prof && prof.verification_status !== "approved" && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your profile is <b>{prof.verification_status.replace(/_/g, " ")}</b>. You will get jobs after Homigo approves it.</p>}
      <Tabs tabs={["today", "upcoming", "completed"]} value={tab} onChange={setTab} />
      {!data[tab].length ? <Empty title="No jobs" /> : (
        <div className="space-y-3">
          {data[tab].map((b) => (
            <Link key={b.id} to={`/coworker/jobs/${b.id}`} className="card block hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.service_name}</p>
                  <p className="text-sm text-slate-500">{dateTime(b.scheduled_start)} · {b.booking_no}</p>
                </div>
                <Badge status={b.status} />
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" /> {b.address.line1}, {b.address.city}</p>
              {b.bring_supplies && <p className="mt-1 text-xs font-medium text-emerald-700">Carry supplies kit</p>}
              {b.payment_mode === "cash" && <p className="mt-1 text-xs text-amber-700">Collect {money(b.total)} cash/UPI</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
