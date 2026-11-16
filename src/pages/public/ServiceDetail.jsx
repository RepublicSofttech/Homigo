import { useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, Briefcase, MapPin, Minus, Plus, ShieldCheck, Star, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import AddressForm from "../../components/AddressForm";
import PayModal from "../../components/PayModal";
import { Empty, ErrorBox, PageLoader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useLocation2 } from "../../context/LocationContext";
import { money, timeOnly, todayISO } from "../../lib/format";

function PartnerCard({ p, selected, onSelect }) {
  return (
    <button onClick={onSelect} className={`w-full rounded-xl border p-4 text-left transition ${selected ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 font-semibold">{p.display_name} {p.verified && <BadgeCheck className="h-4 w-4 text-brand-600" />}</p>
          <p className="text-xs text-slate-500">{p.years_in_business} yrs experience · {p.languages}</p>
        </div>
        <span className="flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
          <Star className="h-3 w-3 fill-white" /> {Number(p.rating_avg) ? Number(p.rating_avg).toFixed(1) : "New"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.distance_km} km away</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.verified_coworkers} verified pros</span>
        <span>{p.jobs_completed} jobs done</span>
      </div>
    </button>
  );
}

export default function ServiceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { location } = useLocation2();
  const isCustomer = user?.user_type === "customer";

  const [addressId, setAddressId] = useState(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  // "nearest" = send to the nearest verified pros, first to accept gets it (gap P1); "choose" = pick a provider
  const [mode, setMode] = useState("nearest");
  const [qty, setQty] = useState({});
  const [day, setDay] = useState(todayISO());
  const [slot, setSlot] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");
  const [bringKit, setBringKit] = useState(false); // gap C13 (only used when the service kit is optional)
  const [answers, setAnswers] = useState({});
  const [pay, setPay] = useState(null);

  const service = useQuery({ queryKey: ["service", id], queryFn: () => api.get(`/services/${id}/`).then((r) => r.data) });
  const addresses = useQuery({ queryKey: ["addresses"], queryFn: () => api.get("/addresses/").then((r) => r.data), enabled: isCustomer });

  useEffect(() => {
    if (addresses.data?.length && !addressId) setAddressId((addresses.data.find((a) => a.is_default) || addresses.data[0]).id);
  }, [addresses.data, addressId]);

  const address = addresses.data?.find((a) => a.id === addressId);
  const point = address ? { lat: address.latitude, lng: address.longitude } : { lat: location.lat, lng: location.lng };

  const avail = useQuery({
    queryKey: ["availability", id, point.lat, point.lng],
    queryFn: () => api.get(`/services/${id}/availability/?lat=${point.lat}&lng=${point.lng}`).then((r) => r.data),
  });
  const options = useMemo(() => (avail.data?.available ? [avail.data.partner, ...avail.data.alternatives] : []), [avail.data]);
  const partner = options.find((p) => p.id === partnerId) || options[0];
  const available = !!avail.data?.available;
  const chosen = mode === "choose" ? partner : null;
  // Items to pick from: the chosen provider's rate card, or platform prices for "nearest available"
  const rows = chosen
    ? chosen.rate_card
    : (service.data?.items || []).map((i) => ({ id: i.id, service_item: i.id, item_name: i.name, price: i.default_price, unit_label: i.unit_label }));

  useEffect(() => {
    setPartnerId(options[0]?.id || null);
    setQty({});
    setSlot(null);
  }, [options, mode]);

  const items = Object.entries(qty).filter(([, q]) => q > 0).map(([sid, q]) => ({ service_item: Number(sid), quantity: q }));
  const duration = Math.max(
    items.reduce((sum, it) => sum + (service.data?.items.find((i) => i.id === it.service_item)?.duration_minutes || 60) * it.quantity, 0),
    60
  );

  const slots = useQuery({
    queryKey: ["slots", chosen?.id, point.lat, point.lng, id, day, duration],
    queryFn: () =>
      api.get(`/slots/?service_id=${id}&date=${day}&duration=${duration}&` + (chosen ? `partner_id=${chosen.id}` : `lat=${point.lat}&lng=${point.lng}`))
        .then((r) => r.data.slots),
    enabled: available,
  });

  const preview = useQuery({
    queryKey: ["preview", chosen?.id, JSON.stringify(items), appliedCoupon, bringKit],
    queryFn: () => api.post("/bookings/price-preview/", { service_id: Number(id), partner_id: chosen?.id ?? null, items, coupon_code: appliedCoupon, bring_supplies: bringKit }).then((r) => r.data),
    enabled: available && items.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (preview.error && appliedCoupon) {
      toast.error(errorMessage(preview.error));
      setAppliedCoupon("");
    }
  }, [preview.error, appliedCoupon]);

  const book = useMutation({
    mutationFn: () =>
      api.post("/bookings/", {
        service_id: Number(id), ...(chosen ? { partner_id: chosen.id } : {}), address_id: addressId, items, scheduled_start: slot,
        payment_mode: paymentMode, coupon_code: appliedCoupon, notes, answers, bring_supplies: bringKit,
        booking_type: service.data.booking_types?.[0] === "instant" ? "scheduled" : service.data.booking_types?.[0] || "scheduled",
      }).then((r) => r.data),
    onSuccess: (b) => {
      if (b.payment_mode === "online") setPay(b);
      else {
        toast.success("Booking placed!");
        nav(`/bookings/${b.id}`);
      }
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (service.isLoading) return <PageLoader />;
  if (service.error) return <div className="mx-auto max-w-3xl p-6"><ErrorBox error={service.error} /></div>;
  const s = service.data;
  const days = Array.from({ length: 7 }, (_, i) => todayISO(i));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/services" className="text-sm text-brand-600">&larr; All services</Link>
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="card">
            <p className="text-sm text-slate-500">{s.category_name}</p>
            <h1 className="text-2xl font-bold">{s.name}</h1>
            <p className="mt-2 text-slate-600">{s.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> {s.warranty_days}-day service warranty</span>
              {Number(s.visit_charge) > 0 && <span>Visit charge {money(s.visit_charge)}</span>}
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">1. Service location</h2>
              {isCustomer && <button className="text-sm text-brand-600" onClick={() => setAddrOpen(true)}>+ Add address</button>}
            </div>
            {isCustomer && addresses.data?.length ? (
              <select className="input" value={addressId || ""} onChange={(e) => setAddressId(Number(e.target.value))}>
                {addresses.data.map((a) => <option key={a.id} value={a.id}>{a.label}: {a.line1}, {a.city} - {a.pincode}</option>)}
              </select>
            ) : (
              <p className="text-sm text-slate-600">Showing providers near <b>{location.name}</b>. {isCustomer ? "Add an address to book." : "Login to choose your exact address."}</p>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold">2. Who should come?</h2>
            {avail.isLoading ? <PageLoader /> : !available ? (
              <Empty title="Not available in your area yet" text="We are adding partners in new areas every week. Try another location." />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button onClick={() => setMode("nearest")} className={`rounded-xl border p-4 text-left ${mode === "nearest" ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 bg-white"}`}>
                    <p className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-accent-500" /> Nearest available pro</p>
                    <p className="mt-1 text-xs text-slate-500">We send your request to the {options.length > 1 ? "nearest verified pros" : "nearest verified pro"}. The first to accept gets the job. Standard price.</p>
                  </button>
                  <button onClick={() => setMode("choose")} className={`rounded-xl border p-4 text-left ${mode === "choose" ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 bg-white"}`}>
                    <p className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-brand-600" /> Choose a provider</p>
                    <p className="mt-1 text-xs text-slate-500">Compare {options.length} nearby {options.length === 1 ? "provider" : "providers"} by distance, rating and price.</p>
                  </button>
                </div>
                {mode === "choose" && options.map((p) => <PartnerCard key={p.id} p={p} selected={p.id === partner?.id} onSelect={() => { setPartnerId(p.id); setQty({}); setSlot(null); }} />)}
              </div>
            )}
          </div>

          {available && (
            <div className="card">
              <h2 className="mb-3 font-semibold">3. Select items</h2>
              <div className="divide-y">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{r.item_name}</p>
                      <p className="text-sm text-slate-500">{money(r.price)} / {r.unit_label}</p>
                    </div>
                    {qty[r.service_item] ? (
                      <div className="flex items-center gap-2">
                        <button className="btn-secondary btn-sm" onClick={() => setQty({ ...qty, [r.service_item]: qty[r.service_item] - 1 })} aria-label="Less"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center font-semibold">{qty[r.service_item]}</span>
                        <button className="btn-secondary btn-sm" onClick={() => setQty({ ...qty, [r.service_item]: qty[r.service_item] + 1 })} aria-label="More"><Plus className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <button className="btn-secondary btn-sm" onClick={() => setQty({ ...qty, [r.service_item]: 1 })}>Add</button>
                    )}
                  </div>
                ))}
              </div>
              {s.questions?.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {s.questions.map((q) => (
                    <div key={q.key}>
                      <label className="label">{q.label}</label>
                      <select className="input" value={answers[q.key] || ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}>
                        <option value="">Select</option>
                        {(q.options || []).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {available && s.supplies_mode !== "none" && s.supplies_list?.length > 0 && (
            <div className="card border-emerald-200 bg-emerald-50/50">
              <h2 className="mb-2 flex items-center gap-2 font-semibold"><Briefcase className="h-4 w-4 text-emerald-700" /> Supplies kit</h2>
              {s.supplies_mode === "included" ? (
                <p className="text-sm text-slate-700">The professional brings everything needed{Number(s.supplies_charge) > 0 ? ` (kit charge ${money(s.supplies_charge)})` : " — no extra charge"}. You don't need to arrange anything.</p>
              ) : (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={bringKit} onChange={(e) => setBringKit(e.target.checked)} />
                  <span>Ask the professional to bring the kit{Number(s.supplies_charge) > 0 ? ` (+${money(s.supplies_charge)})` : ""}</span>
                </label>
              )}
              <p className="mt-2 text-xs text-slate-500">Kit: {s.supplies_list.join(" · ")}</p>
            </div>
          )}

          {available && items.length > 0 && (
            <div className="card">
              <h2 className="mb-3 font-semibold">4. Pick a date & time</h2>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => {
                  const dt = new Date(d + "T00:00:00");
                  return (
                    <button key={d} onClick={() => { setDay(d); setSlot(null); }} className={`min-w-[64px] rounded-lg border px-3 py-2 text-center ${d === day ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white"}`}>
                      <p className="text-xs">{dt.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                      <p className="font-bold">{dt.getDate()}</p>
                    </button>
                  );
                })}
              </div>
              {slots.isLoading ? <PageLoader /> : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {(slots.data || []).map((sl) => (
                    <button key={sl.start} disabled={!sl.available} onClick={() => setSlot(sl.start)}
                      className={`rounded-lg border px-2 py-2 text-sm ${slot === sl.start ? "border-brand-600 bg-brand-50 font-semibold text-brand-700" : "border-slate-200"} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}>
                      {timeOnly(sl.start)}
                    </button>
                  ))}
                </div>
              )}
              <textarea className="input mt-4" rows={2} placeholder="Instructions for the professional (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="card space-y-4">
            <h2 className="font-semibold">Booking summary</h2>
            {!items.length ? <p className="text-sm text-slate-500">Add items to see the price.</p> : preview.isLoading ? <PageLoader /> : preview.data ? (
              <div className="space-y-1 text-sm">
                {preview.data.lines.map((l) => <div key={l.service_item} className="flex justify-between"><span>{l.name} x{l.quantity}</span><span>{money(l.total)}</span></div>)}
                {Number(preview.data.visit_charge) > 0 && <div className="flex justify-between"><span>Visit charge</span><span>{money(preview.data.visit_charge)}</span></div>}
                {preview.data.bring_supplies && <div className="flex justify-between"><span>Supplies kit</span><span>{Number(preview.data.supplies_charge) > 0 ? money(preview.data.supplies_charge) : "Included"}</span></div>}
                {Number(preview.data.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount ({preview.data.coupon})</span><span>-{money(preview.data.discount)}</span></div>}
                <div className="flex justify-between text-slate-500"><span>Convenience fee</span><span>{money(preview.data.convenience_fee)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Taxes</span><span>{money(preview.data.tax)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(preview.data.total)}</span></div>
              </div>
            ) : null}
            <div className="flex gap-2">
              <input className="input" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
              <button className="btn-secondary" disabled={!coupon || !items.length} onClick={() => setAppliedCoupon(coupon)}>Apply</button>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="radio" checked={paymentMode === "cash"} onChange={() => setPaymentMode("cash")} /> Pay after service (cash / UPI)</label>
              <label className="flex items-center gap-2"><input type="radio" checked={paymentMode === "online"} onChange={() => setPaymentMode("online")} /> Pay online now</label>
            </div>
            {!user ? (
              <Link to={`/login?next=/services/${id}`} className="btn-primary w-full">Login to book</Link>
            ) : !isCustomer ? (
              <p className="text-sm text-amber-700">Please use a customer account to book.</p>
            ) : (
              <button className="btn-primary w-full" disabled={!slot || !items.length || !addressId || book.isPending} onClick={() => book.mutate()}>
                {book.isPending ? "Booking..." : !addressId ? "Add an address" : !slot ? "Select a slot" : "Confirm booking"}
              </button>
            )}
          </div>
        </div>
      </div>
      {addrOpen && <AddressForm open onClose={() => setAddrOpen(false)} onSaved={(a) => setAddressId(a.id)} />}
      {pay && <PayModal open purpose="booking" refId={pay.id} amount={pay.total} onClose={() => nav(`/bookings/${pay.id}`)} onPaid={() => nav(`/bookings/${pay.id}`)} />}
    </div>
  );
}
