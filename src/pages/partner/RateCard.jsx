import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import { Badge, Empty, PageHeader, PageLoader } from "../../components/ui";
import { money } from "../../lib/format";

export default function RateCard() {
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ["partner-services"], queryFn: () => api.get("/partner/services/").then((r) => r.data) });
  const rates = useQuery({ queryKey: ["rate-card"], queryFn: () => api.get("/partner/rate-card/").then((r) => r.data) });
  const activeServices = (mine.data || []).filter((s) => s.is_active);
  const items = useQuery({
    queryKey: ["items-for", activeServices.map((s) => s.service).join(",")],
    queryFn: async () => (await Promise.all(activeServices.map((s) => api.get(`/service-items/?service=${s.service}`).then((r) => r.data)))).flat(),
    enabled: activeServices.length > 0,
  });
  const [prices, setPrices] = useState({});
  const inv = () => qc.invalidateQueries({ queryKey: ["rate-card"] });
  const add = useMutation({ mutationFn: (b) => api.post("/partner/rate-card/", b), onSuccess: () => { toast.success("Added"); inv(); }, onError: (e) => toast.error(errorMessage(e)) });
  const upd = useMutation({ mutationFn: ({ id, ...b }) => api.patch(`/partner/rate-card/${id}/`, b), onSuccess: () => { toast.success("Updated"); inv(); }, onError: (e) => toast.error(errorMessage(e)) });

  if (mine.isLoading || rates.isLoading) return <PageLoader />;
  if (!activeServices.length) return <Empty title="Select your services first" text="Go to Onboarding → Services." />;
  return (
    <div>
      <PageHeader title="Rate card" subtitle="Set your price for each item. Price must stay within the platform's min–max range." />
      {activeServices.map((svc) => (
        <div key={svc.id} className="card mb-4">
          <h2 className="mb-3 font-semibold">{svc.service_name}</h2>
          <div className="divide-y">
            {(items.data || []).filter((i) => i.service === svc.service).map((item) => {
              const rate = rates.data.find((r) => r.service_item === item.id);
              const val = prices[item.id] ?? rate?.price ?? item.default_price;
              return (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">Allowed {money(item.price_floor)} – {money(item.price_ceiling)} / {item.unit_label} · suggested {money(item.default_price)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input className="input w-28" type="number" value={val} onChange={(e) => setPrices({ ...prices, [item.id]: e.target.value })} />
                    {rate ? (
                      <>
                        <button className="btn-secondary btn-sm" onClick={() => upd.mutate({ id: rate.id, price: val })}>Save</button>
                        <button className="btn-sm btn" onClick={() => upd.mutate({ id: rate.id, is_active: !rate.is_active })}><Badge status={rate.is_active ? "active" : "inactive"} /></button>
                      </>
                    ) : <button className="btn-primary btn-sm" onClick={() => add.mutate({ service_item: item.id, price: val })}>Offer</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
