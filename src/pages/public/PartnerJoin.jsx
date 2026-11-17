import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BadgeCheck, Bell, Building2, Calculator, Check, CheckCircle2, FileText, Gift, HelpCircle, IndianRupee, Landmark,
  MapPin, Package, Rocket, ShieldCheck, Smartphone, Sparkles, UploadCloud, UserPlus, Users, Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import AppDownload from "../../components/marketing/AppDownload";
import Testimonials from "../../components/marketing/Testimonials";
import { Reveal } from "../../components/Reveal";
import { money } from "../../lib/format";

const GST = 0.18;

const BENEFITS = [
  [Bell, "Jobs come to you", "Nearby bookings are sent to your phone. Accept the ones that suit you — no cold calling."],
  [Users, "Run your whole team", "Add coworkers, assign jobs, and track every visit from one dashboard. Your team gets its own app."],
  [Wallet, "Clear earnings & payouts", "Every booking shows price, commission and your net. Online payments settle straight to your bank."],
  [BadgeCheck, "Verified badge", "Customers see a verified partner with ratings and reviews, so they book you with confidence."],
  [Gift, "Tips are 100% yours", "When a happy customer adds a tip, the full amount goes to you — no commission."],
  [Package, "Kit charges are yours", "If your pro brings cleaning supplies or tools, the kit charge is paid to you with no commission."],
];

/* ---------- Step visuals (small illustrations of our own app) ---------- */
const Card = ({ children }) => <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">{children}</div>;
const Line = ({ w = "w-full", tone = "bg-slate-100" }) => <div className={`h-2.5 rounded-full ${tone} ${w}`} />;
const Tick = ({ children, done = true }) => (
  <p className={`flex items-center gap-2 text-sm ${done ? "text-slate-700" : "text-slate-400"}`}>
    <CheckCircle2 className={`h-4 w-4 ${done ? "text-emerald-500" : "text-slate-300"}`} />{children}
  </p>
);

const VISUALS = [
  <Card key="otp">
    <p className="text-sm font-semibold">Join as partner</p>
    <div className="mt-4 flex items-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><span className="mr-2 text-slate-500">+91</span>98765 43210</div>
    <p className="mt-4 text-xs text-slate-500">Enter OTP</p>
    <div className="mt-2 flex gap-2">{["3", "9", "1", "7", "", ""].map((n, i) => <span key={i} className={`flex h-11 flex-1 items-center justify-center rounded-lg text-lg font-bold ${n ? "bg-brand-50 text-brand-700" : "bg-slate-100"}`}>{n}</span>)}</div>
    <div className="mt-4 rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">Verify & continue</div>
  </Card>,
  <Card key="profile">
    <p className="text-sm font-semibold">Business profile</p>
    <div className="mt-4 space-y-3">
      <div><p className="text-[11px] text-slate-500">Business name</p><p className="text-sm font-medium">Sharma Home Services</p></div>
      <div className="flex h-20 items-center justify-center rounded-xl bg-[radial-gradient(circle,#c7d2fe_1px,transparent_1px)] bg-[length:12px_12px]"><MapPin className="h-7 w-7 fill-brand-600 text-white" /></div>
      <div className="flex flex-wrap gap-1.5">{["Plumber", "Electrician", "Deep cleaning"].map((s) => <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{s}</span>)}</div>
      <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span>Tap repair</span><b>₹149</b></div>
    </div>
  </Card>,
  <Card key="kyc">
    <p className="text-sm font-semibold">KYC documents</p>
    <div className="mt-4 space-y-2">
      {[["PAN card", true], ["Aadhaar (masked)", true], ["Business proof", true], ["Address proof", false]].map(([t, d]) => (
        <div key={t} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <FileText className="h-4 w-4 text-brand-600" /><span className="flex-1 text-sm">{t}</span>
          {d ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <UploadCloud className="h-4 w-4 text-slate-400" />}
        </div>
      ))}
    </div>
  </Card>,
  <Card key="bank">
    <p className="text-sm font-semibold">Bank account for payouts</p>
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white">
      <Landmark className="h-6 w-6 opacity-80" />
      <p className="mt-6 font-mono tracking-widest">XXXX XXXX 4821</p>
      <div className="mt-2 flex justify-between text-[11px] text-slate-300"><span>SHARMA HOME SERVICES</span><span>IFSC ••••0012</span></div>
    </div>
    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Stored masked. Only you and verification can see it.</p>
  </Card>,
  <Card key="team">
    <p className="text-sm font-semibold">Your team</p>
    <div className="mt-4 space-y-2">
      {[["Rakesh K.", "Plumber", "Verified"], ["Sunil M.", "Electrician", "Verified"], ["Amit P.", "Cleaner", "In review"]].map(([n, r, s]) => (
        <div key={n} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{n[0]}</span>
          <div className="flex-1"><p className="text-sm font-medium">{n}</p><p className="text-[11px] text-slate-500">{r}</p></div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s}</span>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-slate-300 py-2 text-center text-xs font-medium text-brand-600">+ Add coworker</div>
    </div>
  </Card>,
  <Card key="verify">
    <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50"><ShieldCheck className="h-6 w-6 text-amber-500" /></span><div><p className="text-sm font-semibold">Verification in progress</p><p className="text-xs text-slate-500">Usually 1–3 working days</p></div></div>
    <div className="mt-5 space-y-2.5"><Tick>Documents received</Tick><Tick>Business details checked</Tick><Tick done={false}>Final approval</Tick></div>
    <div className="mt-5 space-y-2"><Line /><Line w="w-2/3" /></div>
  </Card>,
  <Card key="live">
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50"><Rocket className="h-7 w-7 text-emerald-600" /></span>
      <p className="mt-3 text-lg font-bold">You're live!</p>
      <p className="text-sm text-slate-500">Customers near you can now book you.</p>
    </div>
    <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3">
      <div className="flex justify-between text-sm"><b>New job · Deep cleaning</b><span className="text-xs font-bold text-amber-700">04:58</span></div>
      <p className="text-xs text-slate-600">2.4 km away · ₹1,499</p>
    </div>
  </Card>,
];

const STEPS = [
  [Smartphone, "Register with OTP", "Sign up with your mobile number — no password to remember.", ["Takes under a minute", "Choose “Join as partner”"]],
  [Building2, "Set up your business", "Tell customers who you are and what you do.", ["Business name & base location on the map", "Services you offer", "Your prices (rate card) within Homigo's range"]],
  [FileText, "Upload KYC", "Simple documents, uploaded straight from your phone camera.", ["PAN card", "Aadhaar (masked copy is fine)", "Business proof (Udyam / shop licence / GST)", "Address proof"]],
  [Landmark, "Add your bank account", "Where your earnings and settlements will be paid.", ["Cancelled cheque or passbook", "Stored masked and secure"]],
  [UserPlus, "Add your team", "Add the professionals who will do the jobs.", ["Name, phone and ID of each coworker", "They get verified and use the professional app"]],
  [ShieldCheck, "Homigo verification", "Our team checks your documents and business details.", ["Usually 1–3 working days", "Track status and fix any rejected document in the app"]],
  [Rocket, "Choose a plan & go live", "Pick the plan that fits you and start receiving bookings.", ["Plans and commission are shown once you're approved", "New jobs start arriving near you"]],
];

/* ---------- Scroll-driven steps (sticky panel; content changes as you scroll) ---------- */
function ScrollSteps() {
  const wrap = useRef(null);
  const [active, setActive] = useState(0);
  const n = STEPS.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
      setActive(Math.floor(p * n));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [n]);

  const jump = (i) => {
    const el = wrap.current;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / n) * total, behavior: "smooth" });
  };

  const [Icon, title, text, points] = STEPS[active];
  return (
    <section ref={wrap} className="relative bg-slate-950 text-white" style={{ height: `${n * 75 + 25}vh` }} aria-label="How to become a partner">
      <div className="sticky top-[60px] flex h-[calc(100vh-60px)] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">How to become a partner</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-4xl">Live in {n} simple steps</h2>
            </div>
            <p className="text-sm text-slate-400"><span className="text-2xl font-bold text-white">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}</p>
          </div>
          {/* progress bar (all sizes) */}
          <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/10 lg:hidden">
            <div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${((active + 1) / n) * 100}%` }} />
          </div>
          <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12 lg:gap-8">
            {/* step list */}
            <ol className="hidden space-y-1 lg:col-span-4 lg:block">
              {STEPS.map(([I, t], i) => (
                <li key={t}>
                  <button type="button" onClick={() => jump(i)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === active ? "bg-white/10" : "hover:bg-white/5"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${i < active ? "bg-emerald-500 text-white" : i === active ? "bg-accent-500 text-white" : "bg-white/10 text-slate-400"}`}>
                      {i < active ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={`text-sm font-medium transition ${i === active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>{t}</span>
                  </button>
                </li>
              ))}
            </ol>
            {/* active step content */}
            <div key={active} className="animate-[stepIn_.5s_ease-out] lg:col-span-4">
              <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/40 sm:inline-flex"><Icon className="h-6 w-6" /></span>
              <p className="sm:mt-4 text-xs font-semibold uppercase tracking-wider text-accent-500">Step {active + 1}</p>
              <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h3>
              <p className="mt-2 text-slate-300">{text}</p>
              <ul className="mt-4 space-y-2">
                {points.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-slate-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{p}</li>)}
              </ul>
            </div>
            {/* visual */}
            <div key={`v${active}`} className="-mb-16 flex origin-top scale-[0.8] animate-[stepIn_.6s_ease-out] justify-center sm:mb-0 sm:scale-100 lg:col-span-4">{VISUALS[active]}</div>
          </div>
          <p className="mt-8 hidden text-center text-xs text-slate-500 lg:block">Scroll to see each step · sample screens for illustration</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Earnings estimate (range across plans; plans themselves are shown after approval) ---------- */
function EarningsCalculator({ plans }) {
  const [jobs, setJobs] = useState(4);
  const [avg, setAvg] = useState(600);
  const [days, setDays] = useState(26);

  const r = useMemo(() => {
    const gross = jobs * avg * days;
    const options = plans.length ? plans : [{ commission_percent: 20, price: 0, duration_days: 30 }];
    const nets = options.map((p) => {
      const commission = (gross * Number(p.commission_percent)) / 100;
      return gross - commission - commission * GST - (Number(p.price) * 30) / (p.duration_days || 30);
    });
    const pcts = options.map((p) => Number(p.commission_percent));
    return { gross, low: Math.max(0, Math.min(...nets)), high: Math.max(0, Math.max(...nets)), minPct: Math.min(...pcts), maxPct: Math.max(...pcts) };
  }, [jobs, avg, days, plans]);

  const Slider = ({ label, value, set, min, max, step, fmt }) => (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-lg font-bold text-slate-900">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} aria-label={label} className="mt-2 w-full accent-brand-600" />
    </div>
  );
  const rs = (v) => money(Math.round(v / 100) * 100);

  return (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
      <div className="space-y-7 p-6 sm:p-8">
        <Slider label="Jobs per day (whole team)" value={jobs} set={setJobs} min={1} max={20} step={1} fmt={(v) => v} />
        <Slider label="Average booking value" value={avg} set={setAvg} min={200} max={5000} step={50} fmt={(v) => money(v)} />
        <Slider label="Working days per month" value={days} set={setDays} min={10} max={30} step={1} fmt={(v) => v} />
      </div>
      <div className="flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <div>
          <p className="text-sm text-brand-100">Total bookings value per month</p>
          <p className="mt-1 text-2xl font-bold">{money(r.gross)}</p>
          <p className="mt-6 text-sm text-brand-100">You could take home</p>
          <p className="mt-1 text-3xl font-extrabold sm:text-4xl">{rs(r.low)} – {rs(r.high)}</p>
          <p className="mt-1 text-sm text-brand-100">per month, after commission ({r.minPct}–{r.maxPct}%), GST on commission and plan fee</p>
        </div>
        <p className="mt-6 text-xs text-brand-100">Estimate only. The exact amount depends on the plan you choose after approval. Tips, materials and kit charges are extra and fully yours.</p>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}

export default function PartnerJoin() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get("/plans/").then((r) => r.data) });

  useEffect(() => {
    if (window.location.hash !== "#calculator") return;
    const t = setTimeout(() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" }), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <style>{"@keyframes stepIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}"}</style>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.35),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
              <Sparkles className="h-3.5 w-3.5" /> For service businesses & skilled pros
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">Grow your service business <span className="text-accent-500">with Homigo</span></h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">Get bookings from customers near you. Manage your team, prices and earnings from one simple dashboard.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login?as=partner" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-600">Register as partner <ArrowRight className="h-4 w-4" /></Link>
              <a href="#calculator" className="btn border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10"><Calculator className="h-4 w-4" /> Calculate earnings</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {["No joining fee", "Tips 100% yours", "Choose your jobs"].map((t) => <span key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" />{t}</span>)}
            </div>
          </Reveal>
          <Reveal delay={150} className="hidden lg:block">
            <div className="relative mx-auto max-w-sm pb-16">
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold">New job request</p><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">04:32 left</span></div>
                <p className="mt-3 text-lg font-bold">Home Deep Cleaning</p>
                <p className="text-sm text-slate-500"><MapPin className="mr-1 inline h-3.5 w-3.5" />Sector 21 · 2.4 km away</p>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>Tomorrow, 10:00 AM</span><span className="font-bold">₹1,499</span></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <span className="rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-600">Decline</span>
                  <span className="rounded-lg bg-brand-600 py-2 text-center text-sm font-semibold text-white">Accept</span>
                </div>
              </div>
              <div className="absolute bottom-0 -left-8 rounded-xl bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="text-xs text-slate-500">This week's earnings</p>
                <p className="text-xl font-bold text-emerald-600"><IndianRupee className="inline h-4 w-4" />18,240</p>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">Sample screen for illustration</p>
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal><SectionTitle eyebrow="Why partner with us" title="Everything you need to run and grow" subtitle="Focus on great work. Homigo brings the customers and handles bookings, payments and payouts." /></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon className="h-5 w-5" /></span>
                <p className="mt-4 text-lg font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ScrollSteps />

      {/* Calculator */}
      <section id="calculator" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal><SectionTitle eyebrow="Earnings calculator" title="See what you could earn" subtitle="Move the sliders to match your business." /></Reveal>
        <Reveal><EarningsCalculator plans={plans.data || []} /></Reveal>
      </section>

      <Testimonials audience="partner" eyebrow="Partner stories" title="Partners growing with Homigo" subtitle="In their own words." />

      <AppDownload audience="partner" />

      {/* Final CTA */}
      <section className="px-4 py-20">
        <Reveal>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">Start getting bookings near you</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">Register today. Our team will help you through verification and your first booking.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login?as=partner" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-600">Register as partner <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/faq?for=partner" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10"><HelpCircle className="h-4 w-4" /> Partner FAQs</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
