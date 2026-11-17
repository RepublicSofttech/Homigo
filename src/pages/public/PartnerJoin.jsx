import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BadgeCheck, Bell, Building2, Calculator, Check, ClipboardCheck, FileText, Gift, IndianRupee,
  Landmark, MapPin, Package, Rocket, ShieldCheck, Smartphone, Sparkles, UserPlus, Users, Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Faq, Reveal } from "../../components/Reveal";
import { PageLoader } from "../../components/ui";
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

const STEPS = [
  [Smartphone, "Register with OTP", "Sign up with your mobile number. Takes under a minute."],
  [Building2, "Business profile", "Add your business name, location on the map and the services you offer."],
  [FileText, "Upload KYC", "PAN, Aadhaar (masked), business proof and address proof."],
  [Landmark, "Add bank account", "Where your earnings and settlements will be paid."],
  [UserPlus, "Add your team", "Add coworkers with their ID so they can be verified too."],
  [ShieldCheck, "Homigo verification", "Our team checks your documents. You'll get updates in the app."],
  [Rocket, "Pick a plan & go live", "Set your rate card, choose a plan, and start receiving bookings."],
];

const DOCS = [
  "PAN card (business or owner)",
  "Aadhaar — masked copy is fine",
  "Business proof (Udyam / shop licence / GST, if any)",
  "Address proof of the business",
  "Cancelled cheque or bank passbook",
  "ID proof of each coworker",
];

const FAQ = [
  ["Who can join as a partner?", "Any local service business or skilled professional who can run a small team — plumbers, electricians, cleaning agencies, security agencies, caregivers and more. You need valid KYC and a bank account."],
  ["How much does it cost?", "You pay a monthly subscription based on the plan you choose, plus a small commission on each completed booking. Higher plans have a lower commission. There is no joining fee."],
  ["When is commission charged?", "Only when a booking is completed. Commission is on the service value only — materials, kit charges and tips are not commissioned. GST applies on the commission."],
  ["How do I get paid?", "For online payments, your net earning is added to your Homigo wallet and paid to your bank on the settlement cycle. For cash jobs you keep the cash, and the commission is adjusted from your wallet."],
  ["How long does verification take?", "Usually 1–3 working days after all documents are uploaded. You can track the status and fix any rejected document from your dashboard."],
  ["Can I choose which jobs to take?", "Yes. New jobs near you show up as requests with a timer — accept the ones you want. Bookings made directly for you need to be accepted within the SLA time."],
];

function useInView(id) {
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 400);
    return () => clearTimeout(t);
  }, [id]);
}

function SectionTitle({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`mb-10 ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}

function EarningsCalculator({ plans }) {
  const [jobs, setJobs] = useState(4);
  const [avg, setAvg] = useState(600);
  const [days, setDays] = useState(26);
  const [planId, setPlanId] = useState(null);
  const plan = plans.find((p) => p.id === planId) || plans[Math.min(1, plans.length - 1)];

  const r = useMemo(() => {
    const gross = jobs * avg * days;
    const pct = plan ? Number(plan.commission_percent) : 20;
    const commission = (gross * pct) / 100;
    const gst = commission * GST;
    const planMonthly = plan ? (Number(plan.price) * 30) / (plan.duration_days || 30) : 0;
    return { gross, pct, commission, gst, planMonthly, net: gross - commission - gst - planMonthly };
  }, [jobs, avg, days, plan]);

  const Slider = ({ label, value, set, min, max, step, fmt }) => (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-lg font-bold text-slate-900">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}
        aria-label={label} className="mt-2 w-full accent-brand-600" />
    </div>
  );

  return (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
      <div className="space-y-6 p-6 sm:p-8">
        <Slider label="Jobs per day (whole team)" value={jobs} set={setJobs} min={1} max={20} step={1} fmt={(v) => v} />
        <Slider label="Average booking value" value={avg} set={setAvg} min={200} max={5000} step={50} fmt={(v) => money(v)} />
        <Slider label="Working days per month" value={days} set={setDays} min={10} max={30} step={1} fmt={(v) => v} />
        {plans.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700">Plan</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {plans.map((p) => (
                <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${plan?.id === p.id ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {p.name}<span className="block text-xs font-normal opacity-75">{Number(p.commission_percent)}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <div>
          <p className="text-sm text-brand-100">Estimated monthly earning</p>
          <p className="mt-1 text-4xl font-extrabold sm:text-5xl">{money(Math.max(0, Math.round(r.net)))}</p>
          <dl className="mt-6 space-y-2 text-sm">
            {[
              ["Total bookings value", money(Math.round(r.gross))],
              [`Commission (${r.pct}%)`, `− ${money(Math.round(r.commission))}`],
              ["GST on commission (18%)", `− ${money(Math.round(r.gst))}`],
              [`${plan?.name || "Plan"} subscription`, `− ${money(Math.round(r.planMonthly))}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/10 pb-2"><dt className="text-brand-100">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-xs text-brand-100">
          Estimate only. Tips, materials and kit charges are extra and fully yours. Actual earnings depend on bookings in your area.
        </p>
      </div>
    </div>
  );
}

export default function PartnerJoin() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api.get("/plans/").then((r) => r.data) });
  const planList = plans.data || [];
  const popularIdx = planList.length >= 3 ? 1 : -1;
  useInView("calculator");

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.35),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
              <Sparkles className="h-3.5 w-3.5" /> For service businesses & skilled pros
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Grow your service business <span className="text-accent-500">with Homigo</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Get bookings from customers near you. Manage your team, prices and earnings from one simple dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login?as=partner" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-600">
                Register as partner <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#calculator" className="btn border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10">
                <Calculator className="h-4 w-4" /> Calculate earnings
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {["No joining fee", "Tips 100% yours", "Choose your jobs"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" />{t}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">New job request</p>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">04:32 left</span>
                </div>
                <p className="mt-3 text-lg font-bold">Home Deep Cleaning</p>
                <p className="text-sm text-slate-500"><MapPin className="mr-1 inline h-3.5 w-3.5" />Sector 21 · 2.4 km away</p>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>Tomorrow, 10:00 AM</span><span className="font-bold">₹1,499</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <span className="rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-600">Decline</span>
                  <span className="rounded-lg bg-brand-600 py-2 text-center text-sm font-semibold text-white">Accept</span>
                </div>
              </div>
              <div className="absolute -bottom-16 -left-8 rounded-xl bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="text-xs text-slate-500">This week's earnings</p>
                <p className="text-xl font-bold text-emerald-600"><IndianRupee className="inline h-4 w-4" />18,240</p>
              </div>
            </div>
            <p className="mt-20 text-center text-xs text-slate-500">Sample screen for illustration</p>
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
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-lg font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal><SectionTitle eyebrow="How to become a partner" title="Live in 7 simple steps" subtitle="Do it all from your phone. Save and continue anytime." /></Reveal>
          <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={i * 70}>
                <li className="relative h-full list-none rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                    <Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">{t}</p>
                  <p className="mt-1 text-sm text-slate-600">{d}</p>
                </li>
              </Reveal>
            ))}
            <Reveal delay={STEPS.length * 70}>
              <li className="flex h-full list-none flex-col justify-center rounded-2xl bg-brand-600 p-6 text-white">
                <p className="text-lg font-bold">Ready to start?</p>
                <p className="mt-1 text-sm text-brand-100">It takes about 15 minutes to submit everything.</p>
                <Link to="/login?as=partner" className="btn mt-4 bg-white text-brand-700 hover:bg-brand-50">Start registration</Link>
              </li>
            </Reveal>
          </ol>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal><SectionTitle eyebrow="Earnings calculator" title="See what you could earn" subtitle="Move the sliders to match your business." /></Reveal>
        <Reveal>{plans.isLoading ? <PageLoader /> : <EarningsCalculator plans={planList} />}</Reveal>
      </section>

      {/* Plans */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal><SectionTitle eyebrow="Plans" title="Simple plans, lower commission as you grow" subtitle="Pay monthly. Upgrade or change anytime." /></Reveal>
          {plans.isLoading ? <PageLoader /> : (
            <div className="grid gap-6 md:grid-cols-3">
              {planList.map((p, i) => {
                const popular = i === popularIdx;
                return (
                  <Reveal key={p.id} delay={i * 100}>
                    <div className={`relative flex h-full flex-col rounded-2xl bg-white p-7 ${popular ? "shadow-xl ring-2 ring-brand-600 md:-translate-y-3" : "shadow-sm ring-1 ring-slate-200"}`}>
                      {popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                      <p className="text-lg font-bold text-slate-900">{p.name}</p>
                      <p className="mt-3 text-4xl font-extrabold text-slate-900">{money(p.price)}<span className="text-sm font-normal text-slate-500"> / {p.duration_days} days</span></p>
                      <p className="mt-2 inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{Number(p.commission_percent)}% commission</p>
                      <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
                        <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-600" />{p.max_coworkers ? `Up to ${p.max_coworkers} coworkers` : "Unlimited coworkers"}</li>
                        {(p.features || []).filter((f) => !/coworker/i.test(f)).map((f) => (
                          <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-600" />{f}</li>
                        ))}
                      </ul>
                      <Link to="/login?as=partner" className={`btn mt-6 w-full ${popular ? "btn-primary" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>Choose {p.name}</Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Documents + FAQ */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <SectionTitle center={false} eyebrow="Keep these ready" title="Documents you'll need" />
          <ul className="space-y-3">
            {DOCS.map((d) => (
              <li key={d} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{d}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Your Aadhaar, PAN and bank details are stored masked and are visible only to the verification team.</p>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-3">
          <SectionTitle center={false} eyebrow="FAQ" title="Questions partners ask" />
          <Faq items={FAQ} />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20">
        <Reveal>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">Start getting bookings near you</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">Register today. Our team will help you through verification and your first booking.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login?as=partner" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-600">Register as partner <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/support" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">Talk to us</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
