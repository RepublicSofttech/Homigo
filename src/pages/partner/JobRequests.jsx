import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import { Badge, DataTable, Empty, PageHeader, PageLoader, Tabs } from "../../components/ui";
import { dateTime, money } from "../../lib/format";

function Countdown({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((new Date(until) - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span className={`flex items-center gap-1 font-mono text-sm font-semibold ${left < 60 ? "text-red-600" : "text-amber-700"}`}>
      <Clock className="h-4 w-4" /> {left ? `${mm}:${ss}` : "Expired"}
    </span>
  );
}

/** Gap P1: bookings broadcast to the nearest partners. First partner to accept gets the job. */
export default function JobRequests() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [tab, setTab] = useState("open");
  const { data, isLoading } = useQuery({
    queryKey: ["job-requests", tab],
    queryFn: () => api.get(`/partner/job-requests/${tab === "history" ? "?all=1" : ""}`).then((r) => r.data),
    refetchInterval: tab === "open" ? 10000 : false,
  });
  const act = useMutation({
    mutationFn: ({ id, a, reason }) => api.post(`/partner/job-requests/${id}/${a}/`, reason ? { reason } : {}),
    onSuccess: (res, v) => {
      qc.invalidateQueries({ queryKey: ["job-requests"] });
      qc.invalidateQueries({ queryKey: ["partner-dashboard"] });
      if (v.a === "accept") {
        toast.success("Job is yours! Assign a professional now.");
        nav(`/partner/bookings/${res.data.id}`);
      } else toast("Request declined");
    },
    onError: (e) => {
      toast.error(errorMessage(e));
      qc.invalidateQueries({ queryKey: ["job-requests"] });
    },
  });

  return (
    <div>
      <PageHeader title="Job requests" subtitle="New jobs near you. These are sent to a few nearby partners — the first to accept gets the job." />
      <Tabs tabs={[{ value: "open", label: "Open requests" }, { value: "history", label: "History" }]} value={tab} onChange={setTab} />
      {isLoading ? <PageLoader /> : tab === "history" ? (
        <DataTable rows={data} empty="No requests yet" columns={[
          { key: "booking_no", label: "Booking" }, { key: "service_name", label: "Service" },
          { key: "scheduled_start", label: "When", render: (r) => dateTime(r.scheduled_start) },
          { key: "distance_km", label: "Distance", render: (r) => `${r.distance_km} km` },
          { key: "job_value", label: "Job value", render: (r) => money(r.job_value) },
          { key: "status", label: "Result", render: (r) => <Badge status={r.status === "accepted" ? "completed" : r.status} >{r.status}</Badge> },
        ]} />
      ) : !data.length ? (
        <Empty title="No open job requests" text="Keep this page open — new requests appear here and in notifications." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((r) => (
            <div key={r.id} className="card flex flex-col gap-3 border-amber-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{r.service_name}</p>
                  <p className="text-sm text-slate-500">{dateTime(r.scheduled_start)} · {r.booking_no}</p>
                </div>
                <Countdown until={r.expires_at} />
              </div>
              <p className="flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" /> {r.area} · {r.distance_km} km away</p>
              <ul className="text-sm text-slate-600">
                {r.items.map((i) => <li key={i.name}>{i.name} × {i.quantity} — {money(i.total)}</li>)}
              </ul>
              {r.notes && <p className="rounded bg-slate-50 p-2 text-sm">Note: {r.notes}</p>}
              <div className="flex items-center justify-between border-t pt-3">
                <div>
                  <p className="text-xs text-slate-500">Job value · {r.payment_mode === "cash" ? "cash after service" : "prepaid"}</p>
                  <p className="text-xl font-bold">{money(r.job_value)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" disabled={act.isPending} onClick={() => act.mutate({ id: r.id, a: "decline", reason: "Not available" })}>Decline</button>
                  <button className="btn-success" disabled={act.isPending} onClick={() => act.mutate({ id: r.id, a: "accept" })}>Accept job</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
