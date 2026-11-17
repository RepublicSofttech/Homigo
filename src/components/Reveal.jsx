import { useEffect, useRef, useState } from "react";

/** Fades + slides its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setShown(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

/** Counts up from 0 to `value` once visible. */
export function CountUp({ value, prefix = "", suffix = "", duration = 1200 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    let raf;
    const run = () => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (!el || typeof IntersectionObserver === "undefined") {
      setN(value);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return <span ref={ref}>{prefix}{n.toLocaleString("en-IN")}{suffix}</span>;
}

/** Simple accessible FAQ accordion. items = [[question, answer], ...] */
export function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map(([q, a], i) => (
        <div key={q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-900 hover:bg-slate-50"
          >
            {q}
            <span className={`text-xl leading-none text-brand-600 transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
          </button>
          <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
