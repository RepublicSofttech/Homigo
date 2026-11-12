import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, errorMessage, listOf } from "../../api/client";
import { Badge, Empty, Field, Modal, PageHeader, PageLoader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { dateTime } from "../../lib/format";

const CATS = [["booking", "Booking issue"], ["quality", "Service quality"], ["payment", "Payment & refund"], ["safety", "Safety"], ["partner", "Partner support"], ["verification", "Verification query"], ["other", "Other"]];

export function TicketThread({ ticket, onChanged, admin }) {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const send = useMutation({
    mutationFn: () => api.post(`/tickets/${ticket.id}/messages/`, { message: msg }),
    onSuccess: () => { setMsg(""); onChanged(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const setSt = useMutation({
    mutationFn: () => api.post(`/tickets/${ticket.id}/set-status/`, { status }),
    onSuccess: () => { toast.success("Status updated"); onChanged(); },
  });
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{CATS.find((c) => c[0] === ticket.category)?.[1]} {ticket.booking_no && `· ${ticket.booking_no}`} · by {ticket.user_name}</p>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {ticket.messages.map((m) => (
          <div key={m.id} className={`rounded-lg p-3 text-sm ${m.is_staff ? "bg-brand-50" : "bg-slate-100"}`}>
            <p className="text-xs font-semibold">{m.is_staff ? "HomeServ Support" : m.sender_name} · {dateTime(m.created_at)}</p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
      <textarea className="input" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write a message" />
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={!msg} onClick={() => send.mutate()}>Send</button>
        {admin && (
          <>
            <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
              {["open", "in_progress", "resolved", "closed"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-secondary" onClick={() => setSt.mutate()}>Update status</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Support({ admin }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(!!params.get("booking"));
  const [view, setView] = useState(null);
  const [form, setForm] = useState({ category: params.get("booking") ? "booking" : "other", subject: "", first_message: "" });
  const tickets = useQuery({ queryKey: ["tickets"], queryFn: () => api.get("/tickets/?page_size=100").then((r) => listOf(r.data)) });
  const bookings = useQuery({ queryKey: ["bookings", "for-ticket"], queryFn: () => api.get("/bookings/?page_size=50").then((r) => listOf(r.data)), enabled: !admin });
  const create = useMutation({
    mutationFn: () => api.post("/tickets/", { ...form, booking: params.get("booking") || form.booking || null }),
    onSuccess: () => { toast.success("Ticket raised. We will get back soon."); setOpen(false); qc.invalidateQueries({ queryKey: ["tickets"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const current = tickets.data?.find((t) => t.id === view);
  return (
    <div className={admin ? "" : "mx-auto max-w-4xl px-4 py-8"}>
      <PageHeader title={admin ? "Support tickets" : "Help & support"} actions={!admin && <button className="btn-primary" onClick={() => setOpen(true)}>Raise a ticket</button>} />
      {tickets.isLoading ? <PageLoader /> : !tickets.data?.length ? <Empty title="No tickets" /> : (
        <div className="space-y-2">
          {tickets.data.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} className="card flex w-full items-center justify-between text-left hover:shadow-md">
              <div>
                <p className="font-medium">{t.subject}</p>
                <p className="text-xs text-slate-500">#{t.id} · {dateTime(t.created_at)} {admin && `· ${t.user_name}`} {t.priority === "urgent" && <span className="font-bold text-red-600">· URGENT</span>}</p>
              </div>
              <Badge status={t.status} />
            </button>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Raise a ticket">
        <div className="space-y-3">
          <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          {!params.get("booking") && bookings.data?.length > 0 && (
            <Field label="Related booking (optional)"><select className="input" value={form.booking || ""} onChange={(e) => setForm({ ...form, booking: e.target.value })}><option value="">None</option>{bookings.data.map((b) => <option key={b.id} value={b.id}>{b.booking_no} - {b.service_name}</option>)}</select></Field>
          )}
          <Field label="Subject"><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <Field label="Describe the issue"><textarea className="input" rows={4} value={form.first_message} onChange={(e) => setForm({ ...form, first_message: e.target.value })} /></Field>
          <button className="btn-primary w-full" disabled={!form.subject || !form.first_message || create.isPending} onClick={() => create.mutate()}>Submit</button>
          {user.user_type === "customer" && <p className="text-xs text-slate-500">For safety emergencies choose “Safety” — it is marked urgent.</p>}
        </div>
      </Modal>
      <Modal open={!!current} onClose={() => setView(null)} title={current?.subject} wide>
        {current && <TicketThread ticket={current} admin={admin} onChanged={() => qc.invalidateQueries({ queryKey: ["tickets"] })} />}
      </Modal>
    </div>
  );
}
