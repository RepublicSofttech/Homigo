import {
  Bell, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Home, IndianRupee, KeyRound, MapPin, Navigation,
  Play, Search, ShieldCheck, Smartphone, Star, Users, Wallet, Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../Reveal";

/* ---------- Phone frame ---------- */
function Phone({ children, active }) {
  return (
    <div className={`relative h-[480px] w-[236px] shrink-0 rounded-[2.6rem] bg-slate-900 p-[9px] shadow-2xl transition-all duration-500 ${active ? "scale-100 opacity-100" : "scale-[0.9] opacity-60"}`}>
      <div className="absolute left-1/2 top-[9px] z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white text-slate-900">
        <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[9px] font-semibold text-slate-500"><span>9:41</span><span>●●● ▮</span></div>
        {children}
      </div>
    </div>
  );
}

const Bar = ({ title, sub }) => (
  <div className="bg-brand-600 px-4 pb-4 pt-2 text-white">
    <p className="text-[10px] opacity-80">{sub}</p>
    <p className="text-sm font-bold">{title}</p>
  </div>
);
const Row = ({ icon: Icon, t, s, right, tone = "brand" }) => (
  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone === "green" ? "bg-emerald-100 text-emerald-600" : "bg-brand-100 text-brand-600"}`}><Icon className="h-3.5 w-3.5" /></span>
    <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{t}</p>{s && <p className="truncate text-[9px] text-slate-500">{s}</p>}</div>
    {right && <span className="text-[11px] font-bold">{right}</span>}
  </div>
);
const Btn = ({ children, ghost }) => <div className={`rounded-xl py-2 text-center text-[11px] font-semibold ${ghost ? "border border-slate-200 text-slate-600" : "bg-brand-600 text-white"}`}>{children}</div>;

/* ---------- Sample app screens (illustrations of our own app) ---------- */
const CUSTOMER_SCREENS = [
  ["Find a service", (
    <>
      <Bar sub="Hi there 👋" title="What do you need today?" />
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] text-slate-400"><Search className="h-3 w-3" />Search “tap leak”</div>
        <div className="grid grid-cols-3 gap-2">
          {[[Wrench, "Repair"], [Home, "Cleaning"], [ShieldCheck, "Security"], [Users, "Maid"], [Star, "Events"], [Smartphone, "More"]].map(([I, t]) => (
            <div key={t} className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-2"><I className="h-4 w-4 text-brand-600" /><span className="text-[9px]">{t}</span></div>
          ))}
        </div>
        <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 p-3 text-white"><p className="text-[10px] opacity-80">Offer</p><p className="text-xs font-bold">₹100 off your first booking</p></div>
        <Row icon={Wrench} t="Plumber" s="Starts at ₹149" />
      </div>
    </>
  )],
  ["Pick a slot", (
    <>
      <Bar sub="Home Deep Cleaning" title="Choose date & time" />
      <div className="space-y-3 p-3">
        <div className="flex gap-1.5">{["Mon 18", "Tue 19", "Wed 20", "Thu 21"].map((d, i) => <div key={d} className={`flex-1 rounded-lg py-1.5 text-center text-[9px] font-semibold ${i === 1 ? "bg-brand-600 text-white" : "bg-slate-100"}`}>{d}</div>)}</div>
        <div className="grid grid-cols-3 gap-1.5">{["9 AM", "10 AM", "11 AM", "1 PM", "3 PM", "5 PM"].map((t, i) => <div key={t} className={`rounded-lg border py-1.5 text-center text-[9px] ${i === 1 ? "border-brand-600 bg-brand-50 font-bold text-brand-700" : "border-slate-200"}`}>{t}</div>)}</div>
        <div className="rounded-xl border border-slate-200 p-2.5 text-[10px]">
          <div className="flex justify-between"><span>2 BHK deep clean</span><b>₹1,499</b></div>
          <div className="mt-1 flex justify-between text-emerald-600"><span>Coupon</span><b>− ₹100</b></div>
          <div className="mt-1.5 flex justify-between border-t pt-1.5 font-bold"><span>Total</span><span>₹1,399</span></div>
        </div>
        <Btn>Confirm booking</Btn>
      </div>
    </>
  )],
  ["Track your pro", (
    <>
      <div className="relative h-40 bg-[linear-gradient(135deg,#e0e7ff_25%,#eef2ff_25%,#eef2ff_50%,#e0e7ff_50%,#e0e7ff_75%,#eef2ff_75%)] bg-[length:24px_24px]">
        <MapPin className="absolute left-[30%] top-[55%] h-6 w-6 fill-brand-600 text-white" />
        <Navigation className="absolute right-[28%] top-[25%] h-5 w-5 fill-amber-500 text-amber-500" />
        <span className="absolute bottom-2 left-3 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold shadow">Arriving in 12 min</span>
      </div>
      <div className="space-y-2.5 p-3">
        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">RK</span><div><p className="text-[11px] font-bold">Rakesh · Plumber</p><p className="text-[9px] text-slate-500">★ 4.8 · ID verified</p></div></div>
        {[["Booking confirmed", 1], ["Pro assigned", 1], ["On the way", 1], ["Work started", 0]].map(([t, d]) => (
          <p key={t} className={`flex items-center gap-1.5 text-[10px] ${d ? "" : "text-slate-400"}`}><CheckCircle2 className={`h-3.5 w-3.5 ${d ? "text-emerald-500" : "text-slate-300"}`} />{t}</p>
        ))}
      </div>
    </>
  )],
  ["OTP-safe start", (
    <>
      <Bar sub="Booking HG-1042" title="Pro has arrived" />
      <div className="space-y-3 p-3 text-center">
        <KeyRound className="mx-auto mt-2 h-8 w-8 text-brand-600" />
        <p className="text-[11px] text-slate-600">Share this OTP only when the pro is at your door</p>
        <div className="flex justify-center gap-1.5">{["4", "8", "2", "1"].map((n, i) => <span key={i} className="flex h-10 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-extrabold">{n}</span>)}</div>
        <div className="rounded-xl bg-amber-50 p-2.5 text-left text-[10px] text-amber-800"><b>Extra work?</b> You approve it in the app before it's added to the bill.</div>
      </div>
    </>
  )],
  ["Rate & tip", (
    <>
      <Bar sub="Job completed" title="How was Rakesh?" />
      <div className="space-y-3 p-3 text-center">
        <div className="flex justify-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-6 w-6 fill-accent-500 text-accent-500" />)}</div>
        <div className="flex flex-wrap justify-center gap-1">{["On time", "Polite", "Clean work"].map((t) => <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700">{t}</span>)}</div>
        <p className="text-[11px] font-semibold">Add a tip — 100% goes to the pro</p>
        <div className="grid grid-cols-3 gap-1.5">{["₹30", "₹50", "₹100"].map((t, i) => <span key={t} className={`rounded-lg py-1.5 text-[10px] font-bold ${i === 1 ? "bg-brand-600 text-white" : "bg-slate-100"}`}>{t}</span>)}</div>
        <Btn>Submit</Btn>
      </div>
    </>
  )],
];

const PARTNER_SCREENS = [
  ["New job request", (
    <>
      <Bar sub="Partner app" title="New job near you" />
      <div className="space-y-3 p-3">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
          <div className="flex items-center justify-between"><p className="text-[11px] font-bold">Home Deep Cleaning</p><span className="rounded-full bg-amber-200 px-1.5 text-[9px] font-bold text-amber-800">04:32</span></div>
          <p className="mt-1 text-[9px] text-slate-600">Sector 21 · 2.4 km · Tue 10 AM</p>
          <p className="mt-2 text-base font-extrabold">₹1,499</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5"><Btn ghost>Decline</Btn><Btn>Accept</Btn></div>
        </div>
        <Row icon={Clock} t="Plumber · Tap repair" s="Waiting for you · 3 km" right="₹249" />
      </div>
    </>
  )],
  ["Assign your team", (
    <>
      <Bar sub="Booking HG-1042" title="Assign a professional" />
      <div className="space-y-2 p-3">
        {[["Rakesh K.", "Free now · 1.2 km", true], ["Sunil M.", "Free from 2 PM", false], ["Amit P.", "On a job", false]].map(([n, s, sel]) => (
          <div key={n} className={`flex items-center gap-2 rounded-xl p-2.5 ${sel ? "bg-brand-50 ring-1 ring-brand-600" : "bg-slate-50"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold">{n[0]}</span>
            <div className="flex-1"><p className="text-[11px] font-semibold">{n}</p><p className="text-[9px] text-slate-500">{s}</p></div>
            {sel && <Check className="h-4 w-4 text-brand-600" />}
          </div>
        ))}
        <Btn>Assign Rakesh</Btn>
      </div>
    </>
  )],
  ["Earnings", (
    <>
      <Bar sub="This week" title="₹18,240 earned" />
      <div className="space-y-3 p-3">
        <div className="flex h-20 items-end gap-1.5">{[40, 65, 50, 80, 95, 70, 55].map((h, i) => <div key={i} className="flex-1 rounded-t bg-brand-500" style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }} />)}</div>
        <Row icon={Wallet} t="Wallet balance" s="Next settlement Friday" right="₹9,860" tone="green" />
        <Row icon={IndianRupee} t="Tips received" s="100% yours" right="₹420" tone="green" />
        <Row icon={CalendarDays} t="Jobs completed" s="This week" right="23" />
      </div>
    </>
  )],
  ["Professional's day", (
    <>
      <Bar sub="Today · 3 jobs" title="Your jobs" />
      <div className="space-y-2 p-3">
        <div className="rounded-xl bg-emerald-50 p-2.5"><p className="text-[11px] font-bold">10:00 · Deep cleaning</p><p className="text-[9px] text-slate-600">Sector 21 · Kit required</p><div className="mt-2 grid grid-cols-2 gap-1.5"><Btn ghost>Directions</Btn><Btn>Start with OTP</Btn></div></div>
        <Row icon={Clock} t="1:00 PM · Tap repair" s="Sector 14" />
        <Row icon={Clock} t="4:30 PM · Fan install" s="Sector 9" />
      </div>
    </>
  )],
  ["Stay notified", (
    <>
      <Bar sub="Notifications" title="Never miss a job" />
      <div className="space-y-2 p-3">
        <Row icon={Bell} t="New job request" s="Deep cleaning · 2.4 km" />
        <Row icon={CheckCircle2} t="Customer approved add-on" s="+ ₹180 material" tone="green" />
        <Row icon={Star} t="New 5★ review" s="“Very professional team”" />
        <Row icon={Wallet} t="Settlement paid" s="₹12,400 to your bank" tone="green" />
      </div>
    </>
  )],
];

/* ---------- Section ---------- */
export default function AppDownload({ audience = "customer" }) {
  const screens = audience === "partner" ? PARTNER_SCREENS : CUSTOMER_SCREENS;
  const track = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, dist = Infinity;
      el.querySelectorAll("[data-i]").forEach((n) => {
        const d = Math.abs(n.offsetLeft + n.clientWidth / 2 - mid);
        if (d < dist) { dist = d; best = Number(n.dataset.i); }
      });
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    el.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [screens]);

  const go = (i) => {
    const el = track.current;
    const n = el?.querySelector(`[data-i="${(i + screens.length) % screens.length}"]`);
    if (el && n) el.scrollTo({ left: n.offsetLeft - (el.clientWidth - n.clientWidth) / 2, behavior: "smooth" });
  };

  const copy = audience === "partner"
    ? { eyebrow: "Partner & professional app", title: "Run your business from your phone", text: "Accept jobs, assign your team, track every visit and see your earnings — your professionals get their own job app too.", points: ["Instant job alerts with a timer", "Assign & track your team", "Earnings, tips and settlements"] }
    : { eyebrow: "Homigo app", title: "Book, track and pay — all in one app", text: "Book a verified pro in under 2 minutes, track them live, start the job with your OTP, and pay the way you like.", points: ["Live tracking of your pro", "OTP-secured start & finish", "Rate, tip and rebook in a tap"] };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-5">
        <Reveal className="min-w-0 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">{copy.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-slate-300">{copy.text}</p>
          <ul className="mt-6 space-y-2">
            {copy.points.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{p}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {[[Smartphone, "Download on the", "App Store"], [Play, "Get it on", "Google Play"]].map(([Icon, small, big]) => (
              <div key={big} aria-disabled="true" title="Coming soon"
                className="relative flex cursor-default items-center gap-3 rounded-xl border border-white/20 bg-black px-4 py-2.5">
                <Icon className="h-6 w-6" />
                <div className="leading-tight"><p className="text-[10px] text-slate-300">{small}</p><p className="text-base font-semibold">{big}</p></div>
                <span className="absolute -right-2 -top-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">Soon</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">iOS and Android apps are coming soon. Until then, everything works on this website.</p>
        </Reveal>

        <Reveal delay={120} className="min-w-0 lg:col-span-3">
          <div className="relative">
            <div ref={track} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-[calc(50%-118px)] py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {screens.map(([label, screen], i) => (
                <button key={label} type="button" data-i={i} onClick={() => go(i)} aria-label={`Show ${label}`} className="snap-center text-left">
                  <Phone active={i === active}>{screen}</Phone>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous screen" className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-brand-50 sm:flex"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next screen" className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-brand-50 sm:flex"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="mt-2 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold">{screens[active][0]}</p>
            <div className="flex gap-2">
              {screens.map(([label], i) => (
                <button key={label} type="button" onClick={() => go(i)} aria-label={label} className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50"}`} />
              ))}
            </div>
            <p className="text-[11px] text-slate-500">App preview — sample screens</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
