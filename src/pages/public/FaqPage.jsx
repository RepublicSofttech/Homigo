import { MessageCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Faq, Reveal } from "../../components/Reveal";
import { FAQ_TABS, FAQS } from "../../content/faqs";

export default function FaqPage() {
  const [params, setParams] = useSearchParams();
  const tab = FAQS[params.get("for")] ? params.get("for") : "customer";
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">Help centre</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Frequently asked questions</h1>
          <div role="tablist" aria-label="FAQ topics" className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-1 rounded-2xl bg-white/10 p-1.5">
            {FAQ_TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setParams({ for: k }, { replace: true })}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${tab === k ? "bg-white text-brand-700 shadow" : "text-white hover:bg-white/10"}`}>
                For {label.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-14" key={tab}>
        <Reveal><Faq items={FAQS[tab]} /></Reveal>
        <Reveal>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-200">
            <MessageCircle className="h-8 w-8 text-brand-600" />
            <p className="text-lg font-semibold text-slate-900">Didn't find your answer?</p>
            <Link to="/support" className="btn-primary">Contact support</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
