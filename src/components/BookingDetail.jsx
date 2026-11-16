import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, KeyRound, MapPin, Phone, Star } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { dateTime, money, titleCase } from "../lib/format";
import PayModal from "./PayModal";
import { Badge, ErrorBox, Field, Modal, PageLoader } from "./ui";

function Timeline({ history }) {
  return (
    <ol className="space-y-3">
      {history.map((h, i) => (
        <li key={i} className="flex gap-3">
          {i === history.length - 1 ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" /> : <Circle className="mt-0.5 h-4 w-4 text-slate-300" />}
          <div>
            <p className="text-sm font-medium">{titleCase(h.to_status)}</p>
            <p className="text-xs text-slate-500">{dateTime(h.created_at)} · {h.actor_name}{h.note ? ` · ${h.note}` : ""}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Gap C1: tip the professional after a completed job. 100% goes to the worker. */
function TipCard({ booking, onDone }) {
  const [amount, setAmount] = useState(50);
  const [tip, setTip] = useState(null);
  const name = booking.coworkers[0]?.name || "your professional";
  if (booking.tip_paid) {
    return <div className="card border-emerald-200 bg-emerald-50 text-sm text-emerald-800">You tipped {money(booking.tip_paid)} to {name}. Thank you!</div>;
  }
  const start = async () => {
    try {
      const { data } = await api.post(`/bookings/${booking.id}/tip/`, { amount });
      setTip(data);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-semibold">Tip {name}</h3>
        <p className="text-sm text-slate-500">100% of the tip goes to the professional.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[20, 50, 100, 200].map((v) => (
          <button key={v} type="button" onClick={() => setAmount(v)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${amount === v ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200"}`}>₹{v}</button>
        ))}
        <input type="number" min={10} className="input w-28" placeholder="Other" value={[20, 50, 100, 200].includes(amount) ? "" : amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <button className="btn-primary" disabled={!amount || amount < 10} onClick={start}>Tip {money(amount)}</button>
      {tip && <PayModal open purpose="tip" refId={tip.tip_id} amount={tip.amount} onClose={() => setTip(null)} onPaid={onDone} />}
    </div>
  );
}

function ReviewForm({ booking, onDone }) {
  const [rp, setRp] = useState(5);
  const [rc, setRc] = useState(5);
  const [comment, setComment] = useState("");
  const tags = ["Punctual", "Polite", "Clean work", "Good value", "Expert"];
  const [sel, setSel] = useState([]);
  const m = useMutation({
    mutationFn: () => api.post("/reviews/", { booking: booking.id, rating_partner: rp, rating_coworker: booking.coworkers.length ? rc : null, comment, tags: sel }),
    onSuccess: () => {
      toast.success("Thanks for your review!");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const Stars = ({ v, set }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => set(n)} aria-label={`${n} stars`}>
          <Star className={`h-6 w-6 ${n <= v ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  );
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Rate your experience</h3>
      <Field label={`Provider: ${booking.partner_name}`}><Stars v={rp} set={setRp} /></Field>
      {booking.coworkers.length > 0 && <Field label={`Professional: ${booking.coworkers[0].name}`}><Stars v={rc} set={setRc} /></Field>}
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button key={t} type="button" onClick={() => setSel(sel.includes(t) ? sel.filter((x) => x !== t) : [...sel, t])} className={`rounded-full border px-3 py-1 text-xs ${sel.includes(t) ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200"}`}>{t}</button>
        ))}
      </div>
      <textarea className="input" rows={3} placeholder="Tell us more (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button className="btn-primary" onClick={() => m.mutate()} disabled={m.isPending}>Submit review</button>
    </div>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user.user_type;
  const qc = useQueryClient();
  const key = ["booking", id];
  const { data: b, isLoading, error } = useQuery({ queryKey: key, queryFn: () => api.get(`/bookings/${id}/`).then((r) => r.data), refetchInterval: 15000 });
  const [modal, setModal] = useState(null);
  const [input, setInput] = useState({});

  const act = useMutation({
    mutationFn: ({ path, body }) => api.post(`/bookings/${id}/${path}/`, body || {}),
    onSuccess: () => {
      toast.success("Updated");
      setModal(null);
      setInput({});
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const run = (path, body) => act.mutate({ path, body });

  const eligible = useQuery({
    queryKey: ["eligible", id],
    queryFn: () => api.get(`/bookings/${id}/eligible-coworkers/`).then((r) => r.data),
    enabled: role === "partner" && modal === "assign",
  });
  const cancelPreview = useQuery({
    queryKey: ["cancel-preview", id],
    queryFn: () => api.get(`/bookings/${id}/cancel-preview/`).then((r) => r.data),
    enabled: modal === "cancel",
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} />;

  const s = b.status;
  const field = ["coworker", "partner"].includes(role);
  const canCancel = ["customer", "partner", "admin"].includes(role) && !["completed", "cancelled", "in_progress", "completion_requested", "no_show"].includes(s);
  const pendingAddons = b.items.filter((i) => i.addon_status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-slate-500">{b.booking_no}</p>
          <h1 className="text-2xl font-bold">{b.service_name}</h1>
          <p className="text-sm text-slate-500">{dateTime(b.scheduled_start)} · {b.partner_name || "Finding the nearest professional"}</p>
        </div>
        <Badge status={s}>{b.status_label}</Badge>
      </div>

      {s === "searching" && b.searching && (
        <div className="card flex items-center gap-3 border-amber-200 bg-amber-50">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" /></span>
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Finding the nearest professional…</p>
            <p className="text-amber-800">Sent to {b.searching.partners_notified} nearby verified {b.searching.partners_notified === 1 ? "partner" : "partners"} (round {b.searching.round}). The first to accept gets your job. You will be notified.</p>
          </div>
        </div>
      )}

      {role === "customer" && ["assigned", "on_the_way", "arrived", "in_progress", "completion_requested"].includes(s) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card flex items-center gap-3 border-brand-200 bg-brand-50">
            <KeyRound className="h-6 w-6 text-brand-600" />
            <div><p className="text-xs text-slate-500">Start OTP (share when professional arrives)</p><p className="text-2xl font-bold tracking-widest">{b.start_otp}</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-emerald-600" />
            <div><p className="text-xs text-slate-500">Completion OTP (share when work is done)</p><p className="text-2xl font-bold tracking-widest">{b.end_otp}</p></div>
          </div>
        </div>
      )}

      {role === "customer" && b.payment_mode === "online" && b.payment_status === "unpaid" && s === "payment_pending" && (
        <div className="card flex items-center justify-between bg-amber-50">
          <p className="text-sm font-medium text-amber-800">Payment pending. Complete payment to send this booking to the provider.</p>
          <button className="btn-primary" onClick={() => setModal("pay")}>Pay {money(b.total)}</button>
        </div>
      )}

      {b.bring_supplies && !["completed", "cancelled"].includes(s) && (
        <div className="card border-emerald-200 bg-emerald-50 text-sm">
          <p className="font-semibold text-emerald-900">{role === "customer" ? "The professional will bring the supplies kit" : "Carry the supplies kit for this job"}</p>
          <p className="text-emerald-800">{b.supplies_list.join(" · ")}{b.supplies_confirmed ? " — confirmed at start" : ""}</p>
        </div>
      )}

      {pendingAddons.length > 0 && role === "customer" && (
        <div className="card border-amber-300 bg-amber-50">
          <p className="mb-2 font-semibold text-amber-900">Approve extra work</p>
          {pendingAddons.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-1 text-sm">
              <span>{i.name} x{i.quantity} — {money(i.total)}</span>
              <span className="flex gap-2">
                <button className="btn-success btn-sm" onClick={() => run(`addons/${i.id}/approve`)}>Approve</button>
                <button className="btn-secondary btn-sm" onClick={() => run(`addons/${i.id}/reject`)}>Reject</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {role === "partner" && s === "pending_acceptance" && (
          <>
            <button className="btn-success" onClick={() => run("accept")}>Accept booking</button>
            <button className="btn-danger" onClick={() => setModal("reject")}>Reject</button>
          </>
        )}
        {role === "partner" && ["confirmed", "assigned"].includes(s) && <button className="btn-primary" onClick={() => setModal("assign")}>{s === "assigned" ? "Reassign" : "Assign professional"}</button>}
        {field && s === "assigned" && <button className="btn-primary" onClick={() => run("on-the-way")}>Start travel (On the way)</button>}
        {field && s === "on_the_way" && <button className="btn-primary" onClick={() => run("arrived")}>Mark arrived</button>}
        {field && s === "arrived" && (
          <>
            <button className="btn-primary" onClick={() => setModal("start")}>Start job (OTP)</button>
            <button className="btn-secondary" onClick={() => run("no-show", { note: "Customer not available" })}>Customer no-show</button>
          </>
        )}
        {field && s === "in_progress" && (
          <>
            <button className="btn-secondary" onClick={() => setModal("addon")}>Add extra work / material</button>
            <button className="btn-primary" onClick={() => setModal("complete")}>Complete job (OTP)</button>
            <button className="btn-secondary" onClick={() => run("request-completion")}>Ask customer to confirm</button>
          </>
        )}
        {field && s === "completion_requested" && <button className="btn-primary" onClick={() => setModal("complete")}>Complete with OTP</button>}
        {field && b.payment_mode === "cash" && ["in_progress", "completion_requested"].includes(s) && !b.cash_collected && (
          <button className="btn-secondary" onClick={() => run("cash-collected")}>Mark cash collected ({money(b.total)})</button>
        )}
        {role === "customer" && s === "completion_requested" && <button className="btn-success" onClick={() => run("confirm-completion")}>Confirm work completed</button>}
        {canCancel && <button className="btn-secondary text-red-600" onClick={() => setModal("cancel")}>Cancel booking</button>}
        {role === "customer" && <Link to={`/support?booking=${b.id}`} className="btn-secondary">Need help?</Link>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="card">
            <h3 className="mb-3 font-semibold">Items & bill</h3>
            <div className="space-y-1 text-sm">
              {b.items.map((i) => (
                <div key={i.id} className={`flex justify-between ${i.addon_status === "rejected" ? "text-slate-400 line-through" : ""}`}>
                  <span>{i.name} x{i.quantity} {i.is_addon && <Badge status={i.addon_status === "approved" ? "approved" : i.addon_status}>{i.is_material ? "material" : "add-on"} · {i.addon_status}</Badge>}</span>
                  <span>{money(i.total)}</span>
                </div>
              ))}
              {Number(b.visit_charge) > 0 && <div className="flex justify-between"><span>Visit charge</span><span>{money(b.visit_charge)}</span></div>}
              {b.bring_supplies && <div className="flex justify-between"><span>Supplies kit</span><span>{Number(b.supplies_charge) > 0 ? money(b.supplies_charge) : "Included"}</span></div>}
              {Number(b.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount {b.coupon_code}</span><span>-{money(b.discount)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>Convenience fee + tax</span><span>{money(Number(b.convenience_fee) + Number(b.tax))}</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(b.total)}</span></div>
              <p className="text-xs text-slate-500">Payment: {titleCase(b.payment_mode)} · {titleCase(b.payment_status)}{b.cash_collected ? " · cash collected" : ""}</p>
            </div>
          </div>
          {role === "customer" && s === "completed" && !b.has_review && <ReviewForm booking={b} onDone={() => qc.invalidateQueries({ queryKey: key })} />}
          {role === "customer" && s === "completed" && <TipCard booking={b} onDone={() => qc.invalidateQueries({ queryKey: key })} />}
          {role !== "customer" && b.tip_paid && <div className="card text-sm">Customer tipped <b>{money(b.tip_paid)}</b> — pass it 100% to {b.coworkers[0]?.name || "the professional"}.</div>}
          <div className="card">
            <h3 className="mb-3 font-semibold">Timeline</h3>
            <Timeline history={b.history} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="card text-sm">
            <h3 className="mb-2 font-semibold">Service address</h3>
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" />{[b.address.line1, b.address.line2, b.address.landmark, b.address.city, b.address.pincode].filter(Boolean).join(", ")}</p>
            {role !== "customer" && (
              <>
                <p className="mt-2 flex gap-2"><Phone className="h-4 w-4 text-slate-400" />{b.customer_name} · {b.customer_phone}</p>
                <a className="mt-2 inline-block text-brand-600" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}>Open in Google Maps</a>
              </>
            )}
            {b.notes && <p className="mt-2 rounded bg-slate-50 p-2 text-slate-600">Note: {b.notes}</p>}
          </div>
          <div className="card text-sm">
            <h3 className="mb-2 font-semibold">Professional</h3>
            {b.coworkers.length ? b.coworkers.map((c) => <p key={c.id}>{c.name} {c.phone && `· ${c.phone}`}</p>) : <p className="text-slate-500">Not assigned yet</p>}
          </div>
          {s === "cancelled" && (
            <div className="card text-sm">
              <h3 className="mb-1 font-semibold">Cancellation</h3>
              <p>By {b.cancelled_by}: {b.cancel_reason}</p>
              {Number(b.cancellation_fee) > 0 && <p>Fee: {money(b.cancellation_fee)}</p>}
            </div>
          )}
        </div>
      </div>

      <Modal open={modal === "reject"} onClose={() => setModal(null)} title="Reject booking">
        <p className="mb-3 text-sm text-slate-500">The booking will move to the next nearest partner, or be cancelled with a full refund.</p>
        <textarea className="input" rows={3} placeholder="Reason" value={input.reason || ""} onChange={(e) => setInput({ reason: e.target.value })} />
        <button className="btn-danger mt-3 w-full" disabled={!input.reason} onClick={() => run("reject", { reason: input.reason })}>Reject</button>
      </Modal>
      <Modal open={modal === "cancel"} onClose={() => setModal(null)} title="Cancel booking">
        {cancelPreview.data && <p className="mb-3 text-sm">Cancellation fee: <b>{money(cancelPreview.data.fee)}</b>{Number(b.amount_paid) > 0 && <> · Refund: <b>{money(cancelPreview.data.refund)}</b></>}</p>}
        <textarea className="input" rows={3} placeholder="Reason" value={input.reason || ""} onChange={(e) => setInput({ reason: e.target.value })} />
        <button className="btn-danger mt-3 w-full" disabled={!input.reason} onClick={() => run("cancel", { reason: input.reason })}>Confirm cancellation</button>
      </Modal>
      <Modal open={modal === "assign"} onClose={() => setModal(null)} title="Assign professional">
        {eligible.isLoading ? <PageLoader /> : eligible.data?.length ? (
          <div className="space-y-2">
            {eligible.data.map((c) => (
              <button key={c.id} onClick={() => run("assign", { coworker_ids: [c.id] })} className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-slate-50">
                <span><b>{c.name}</b> <span className="text-xs text-slate-500">{c.phone} · {c.skill_level}</span></span>
                <span className="text-xs">★ {Number(c.rating).toFixed(1)}</span>
              </button>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">No free approved coworker with this skill at this time.</p>}
      </Modal>
      <Modal open={modal === "start" || modal === "complete"} onClose={() => setModal(null)} title={modal === "start" ? "Enter start OTP" : "Enter completion OTP"}>
        <p className="mb-3 text-sm text-slate-500">Ask the customer for the 4-digit OTP shown in their app.</p>
        <input className="input text-center text-xl tracking-[0.5em]" maxLength={6} value={input.otp || ""} onChange={(e) => setInput({ ...input, otp: e.target.value.replace(/\D/g, "") })} />
        {modal === "start" && b.bring_supplies && (
          <label className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm">
            <input type="checkbox" className="mt-1" checked={!!input.kit} onChange={(e) => setInput({ ...input, kit: e.target.checked })} />
            <span>I have the full supplies kit: {b.supplies_list.join(", ")}</span>
          </label>
        )}
        <button className="btn-primary mt-3 w-full" disabled={!input.otp || (modal === "start" && b.bring_supplies && !input.kit)}
          onClick={() => run(modal, modal === "start" ? { otp: input.otp, kit_confirmed: !!input.kit } : { otp: input.otp })}>Verify</button>
      </Modal>
      <Modal open={modal === "addon"} onClose={() => setModal(null)} title="Add extra work / material">
        <div className="space-y-3">
          <Field label="Description"><input className="input" value={input.name || ""} onChange={(e) => setInput({ ...input, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)"><input className="input" type="number" value={input.price || ""} onChange={(e) => setInput({ ...input, price: e.target.value })} /></Field>
            <Field label="Quantity"><input className="input" type="number" min={1} value={input.quantity || 1} onChange={(e) => setInput({ ...input, quantity: e.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={input.is_material ?? true} onChange={(e) => setInput({ ...input, is_material: e.target.checked })} /> This is material (no commission)</label>
          <button className="btn-primary w-full" disabled={!input.name || !input.price} onClick={() => run("addons", { name: input.name, price: input.price, quantity: input.quantity || 1, is_material: input.is_material ?? true })}>Send to customer for approval</button>
        </div>
      </Modal>
      {modal === "pay" && <PayModal open purpose="booking" refId={b.id} amount={b.total} onClose={() => setModal(null)} onPaid={() => qc.invalidateQueries({ queryKey: key })} />}
    </div>
  );
}
