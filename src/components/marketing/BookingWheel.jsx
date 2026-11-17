import { ArrowRight, Check, KeyRound, Search, ThumbsUp, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollStep } from "./useScrollStep";

const STEPS = [
  [Search, "Pick a service", "Search or browse, see the price upfront and choose a time that suits you.",
    ["Clear prices before you book", "Choose items & a time slot", "Apply offers at checkout"]],
  [UserCheck, "We match a verified pro", "The nearest verified partner accepts your job — or you choose a provider yourself.",
    ["Nearest available pro, fast", "Or pick by rating & distance", "ID-verified, background-checked pros"]],
  [KeyRound, "Work starts with your OTP", "Share the start OTP only when the pro is at your door. You stay in control throughout.",
    ["OTP-secured start & finish", "Extra work only with your approval", "Track every step in the app"]],
  [ThumbsUp, "Pay & rate", "Pay the way you like, then rate the job. Loved it? Add a tip.",
    ["Cash, UPI or pay online", "Tips go 100% to the pro", "Service warranty on eligible jobs"]],
];

const GAP = 48; // degrees between nodes on the wheel

/** DynaTech-style scroll wheel: the ring rotates so the active step sits at 3 o'clock; content changes on the right. */
export default function BookingWheel() {
  const n = STEPS.length;
  const [ref, active, jump] = useScrollStep(n);
  const [Icon, title, text, points] = STEPS[active];
  const rot = -active * GAP;

  return (
    <section ref={ref} className="relative bg-[#1f2a5c]" style={{ height: `${n * 80 + 20}vh` }} aria-label="How booking works">
      <div className="sticky top-[60px] flex h-[calc(100vh-60px)] items-center overflow-hidden text-white">
        {/* backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(79,70,229,0.45),transparent_55%)]" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-[70%] w-[45%] bg-[linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[length:56px_56px] [mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_70%)]" />

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 lg:grid-cols-2 lg:gap-12">
          {/* Wheel */}
          <div className="relative mx-auto h-[290px] w-[290px] sm:h-[420px] sm:w-[420px] lg:-ml-6 lg:h-[520px] lg:w-[520px]">
            {/* outer glow disk (right half emphasised, like a half-moon) */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_50%,rgba(56,189,248,0.35),rgba(30,64,175,0.35)_45%,transparent_70%)]" />
            <div className="absolute inset-0 rounded-full [background:conic-gradient(from_-90deg,transparent_0deg,rgba(14,165,233,0.55)_90deg,rgba(14,165,233,0.15)_180deg,transparent_180deg)]" />
            {/* track */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              {/* highlight segment at 3 o'clock (rotated -90 so 0 is top -> use offset) */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round"
                strokeDasharray={`${(2 * Math.PI * 38 * 30) / 360} ${2 * Math.PI * 38}`}
                strokeDashoffset={-(2 * Math.PI * 38 * 75) / 360} />
            </svg>

            {/* rotating ring with numbered nodes */}
            <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `rotate(${rot}deg)` }}>
              {STEPS.map(([, t], i) => {
                const a = (i * GAP * Math.PI) / 180;
                const dist = Math.abs(i - active);
                return (
                  <button key={t} type="button" onClick={() => jump(i)} aria-label={`Step ${i + 1}: ${t}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${50 + 38 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%` }}>
                    <span className="block transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `rotate(${-rot}deg)` }}>
                      <span className={`flex items-center justify-center rounded-full font-bold transition-all duration-500
                        ${i === active ? "h-14 w-14 bg-accent-500 text-lg text-white shadow-[0_0_0_8px_rgba(245,158,11,0.2),0_10px_30px_rgba(245,158,11,0.45)] sm:h-16 sm:w-16 sm:text-xl"
                          : i < active ? "h-10 w-10 bg-sky-500 text-white sm:h-12 sm:w-12" : "h-10 w-10 bg-[#2b3a7a] text-slate-300 ring-1 ring-white/20 sm:h-12 sm:w-12"}`}
                        style={{ opacity: dist > 2 ? 0.25 : 1 }}>
                        {i < active ? <Check className="h-5 w-5" /> : i + 1}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* center */}
            <div className="absolute left-1/2 top-1/2 flex h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#1f2a5c] text-center shadow-[inset_0_0_40px_rgba(59,130,246,0.35),0_0_0_10px_rgba(255,255,255,0.04)]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <circle cx="50" cy="50" r="47" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="transition-all duration-700"
                  strokeDasharray={`${(2 * Math.PI * 47 * (active + 1)) / n} ${2 * Math.PI * 47}`} />
              </svg>
              <span key={active} className="animate-[wheelIn_.5s_ease-out]"><Icon className="mx-auto h-6 w-6 text-accent-500 sm:h-8 sm:w-8" /></span>
              <p className="mt-1 text-sm font-bold leading-tight sm:mt-2 sm:text-2xl">Homigo's<br />4-Step<br className="hidden sm:block" /> Booking</p>
            </div>
          </div>

          {/* Content */}
          <div key={active} className="animate-[wheelIn_.6s_ease-out] text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">How it works</p>
            <div className="mt-3 flex items-baseline justify-center gap-3 lg:justify-start">
              <span className="text-5xl font-extrabold text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)] sm:text-6xl">{String(active + 1).padStart(2, "0")}</span>
              <h2 className="text-2xl font-bold sm:text-4xl">{title}</h2>
            </div>
            <p className="mx-auto mt-4 max-w-md text-slate-200 lg:mx-0">{text}</p>
            <ul className="mx-auto mt-5 inline-block space-y-2.5 text-left lg:mx-0">
              {points.map((p, i) => (
                <li key={p} className="flex items-center gap-2.5 text-sm sm:text-base">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i % 2 === 0 ? "bg-lime-400" : "bg-white"}`} />
                  <span className={i % 2 === 0 ? "font-semibold text-lime-300" : "text-slate-100"}>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link to="/services" className="btn bg-accent-500 px-6 py-3 text-white hover:bg-accent-600">Book a service <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/how-it-works" className="text-sm font-semibold text-sky-200 hover:text-white">See full process →</Link>
            </div>
            <div className="mt-8 hidden gap-2 lg:flex">
              {STEPS.map(([, t], i) => (
                <button key={t} type="button" onClick={() => jump(i)} aria-label={`Go to step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === active ? "w-10 bg-accent-500" : "w-5 bg-white/25 hover:bg-white/40"}`} />
              ))}
            </div>
          </div>
        </div>
        <style>{"@keyframes wheelIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}"}</style>
      </div>
    </section>
  );
}
