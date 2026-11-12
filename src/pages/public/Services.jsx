import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api, listOf } from "../../api/client";
import { Empty, PageHeader, PageLoader } from "../../components/ui";
import { ServiceCard } from "./Home";

export default function Services() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api.get("/categories/").then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ["services", q, category],
    queryFn: () => api.get(`/services/?page_size=100&q=${encodeURIComponent(q)}${category ? `&category=${category}` : ""}`).then((r) => listOf(r.data)),
  });
  const set = (k, v) => {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    setParams(p);
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader title="All services" subtitle="Book verified professionals near you" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search services..." defaultValue={q} onKeyDown={(e) => e.key === "Enter" && set("q", e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button className={`btn-sm btn ${!category ? "bg-brand-600 text-white" : "border bg-white"}`} onClick={() => set("category", "")}>All</button>
          {(cats.data || []).map((c) => (
            <button key={c.id} className={`btn-sm btn ${String(c.id) === category ? "bg-brand-600 text-white" : "border bg-white"}`} onClick={() => set("category", c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <PageLoader /> : data.length === 0 ? <Empty title="No services found" text="Try another search word." /> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}
