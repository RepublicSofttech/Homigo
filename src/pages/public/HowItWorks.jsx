import {
  ArrowRight, BadgeCheck, Bell, Building2, CalendarClock, CheckCircle2, ClipboardList, FileText, Gift, Home, IndianRupee,
  KeyRound, ListChecks, MapPin, Navigation, PackageCheck, PlusCircle, Rocket, Search, ShieldCheck, Smartphone,
  Star, UserCheck, UserPlus, Users, Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Reveal } from "../../components/Reveal";

const FLOWS = {
  customer: {
    label: "For customers",
    title: "From booking to done — in 6 easy steps",
    cta: ["Book a service", "/services"],
    steps: [
      [Search, "Find your service", "Search or browse categories. Every service shows what's included, the starting price and any warranty."],
      [ListChecks, "Choose items & a slot", "Pick the exact work you need and a time slot. The price is calculated upfront before you confirm."],
      [UserCheck, "Get a verified pro", "Let us send the nearest available pro, or choose a provider yourself by rating and distance."],
      [Navigation, "Track the visit", "See when your pro is assigned and on the way. Exact address is shared only with them."],
      [KeyRound, "Start & finish with OTP", "Share the start OTP when the pro arrives. Any extra work or material needs your approval in the app."],
      [Star, "Pay, rate & tip", "Pay online or after service. Rate the job and add a tip — 100% of it goes to the pro."],
    ],
    promises: [[ShieldCheck, "Verified pros"], [IndianRupee, "Upfront price"], [KeyRound, "OTP-secured"], [BadgeCheck, "Warranty"]],
  },
  partner: {
    label: "For partners",
    title: "Run your service business on Homigo",
    cta: ["Become a partner", "/partner/join"],
    steps: [
      [Smartphone, "Register", "Sign up with your mobile number and choose “Join as partner”."],
      [Building2, "Set up your business", "Add business details, your base location, the services you offer and your rate card."],
      [FileText, "KYC & bank", "Upload KYC documents and add your bank account for payouts."],
      [UserPlus, "Add your team", "Add coworkers with their ID. They get verified and use the professional app."],
      [Rocket, "Get verified & go live", "Once approved and your plan is active, you start appearing to customers nearby."],
      [Bell, "Accept jobs", "New jobs near you arrive as requests with a timer. Accept, assign a coworker, done."],
      [Wallet, "Get paid", "See price, commission and your net for every booking. Earnings settle to your bank."],
    ],
    promises: [[Bell, "Jobs near you"], [Users, "Team app"], [Wallet, "Clear payouts"], [Gift, "Tips 100% yours"]],
  },
  pro: {
    label: "For professionals",
    title: "Your day as a Homigo professional",
    cta: ["Ask your partner to add you", "/partner/join"],
    steps: [
      [UserPlus, "Get added by a partner", "Your Area Partner adds you with your ID. Once verified, you can log in with your phone number."],
      [ClipboardList, "See today's jobs", "Your jobs for today and upcoming days, with service, time and area."],
      [MapPin, "Reach the customer", "Mark “On the way” and open directions in Google Maps. Mark “Arrived” at the door."],
      [PackageCheck, "Check your kit", "If the job needs supplies, confirm you have the kit before starting."],
      [KeyRound, "Start with OTP", "Ask the customer for the start OTP. The job begins only after it's verified."],
      [PlusCircle, "Add extra work if needed", "Add extra work or material with a price. The customer approves it in their app."],
      [CheckCircle2, "Finish & collect", "Complete with the customer's OTP, collect cash if it's a pay-after-service job, and see your tips."],
    ],
    promises: [[CalendarClock, "Clear schedule"], [Navigation, "Directions"], [KeyRound, "OTP safety"], [Gift, "Tips for you"]],
  },
};

const KEYS = Object.keys(FLOWS);

export default function HowItWorks() {
  const [params, setParams] = useSearchParams();
  const initial = KEYS.includes(params.get("for")) ? params.get("for") : "customer";
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(KEYS.includes(params.get("for")) ? params.get("for") : "customer"), [params]);
  const flow = FLOWS[tab];

  return (
    <div className="overflow-x-clip">
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">How it works</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Simple for customers. Powerful for service businesses.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">See exactly what happens at every step — whether you're booking a service, running a team, or doing the job.</p>
          <div role="tablist" aria-label="Choose who you are" className="mx-auto mt-10 inline-flex flex-wrap justify-center gap-1 rounded-2xl bg-white/10 p-1.5">
            {KEYS.map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setParams({ for: k }, { replace: true })}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition sm:px-6 ${tab === k ? "bg-white text-brand-700 shadow" : "text-white hover:bg-white/10"}`}>
                {FLOWS[k].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16" key={tab}>
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">{flow.title}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {flow.promises.map(([Icon, t]) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"><Icon className="h-4 w-4" />{t}</span>
            ))}
          </div>
        </Reveal>

        <ol className="relative mt-12 space-y-6 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-0.5 before:bg-brand-100 sm:before:left-7">
          {flow.steps.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 60}>
              <li className="relative flex gap-5">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step {i + 1}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-slate-900 px-6 py-10 text-center text-white">
            <Home className="h-8 w-8 text-accent-500" />
            <p className="text-2xl font-bold">Ready when you are</p>
            <Link to={flow.cta[1]} className="btn mt-2 bg-accent-500 px-6 py-3 text-white hover:bg-accent-600">{flow.cta[0]} <ArrowRight className="h-4 w-4" /></Link>
            <Link to={`/faq?for=${tab}`} className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline">Read the FAQs</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
