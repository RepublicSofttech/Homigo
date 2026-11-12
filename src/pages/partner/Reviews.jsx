import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage, listOf } from "../../api/client";
import { Empty, PageHeader, PageLoader } from "../../components/ui";
import { dateOnly } from "../../lib/format";

export function ReviewCard({ r, children }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{r.customer_name} <span className="text-xs font-normal text-slate-500">· {r.service_name} · {dateOnly(r.created_at)}</span></p>
        <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {r.rating_partner}</span>
      </div>
      {r.coworker_name && <p className="text-xs text-slate-500">Professional: {r.coworker_name} ({r.rating_coworker}★)</p>}
      {r.tags?.length > 0 && <p className="mt-1 text-xs text-brand-700">{r.tags.join(" · ")}</p>}
      {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
      {r.reply && <p className="mt-2 rounded bg-slate-50 p-2 text-sm"><b>Reply:</b> {r.reply}</p>}
      {children}
    </div>
  );
}

export default function PartnerReviews() {
  const qc = useQueryClient();
  const [text, setText] = useState({});
  const { data, isLoading } = useQuery({ queryKey: ["partner-reviews"], queryFn: () => api.get("/partner/reviews/?page_size=100").then((r) => listOf(r.data)) });
  const act = useMutation({
    mutationFn: ({ id, a, body }) => api.post(`/partner/reviews/${id}/${a}/`, body),
    onSuccess: () => { toast.success("Done"); qc.invalidateQueries({ queryKey: ["partner-reviews"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (isLoading) return <PageLoader />;
  return (
    <div>
      <PageHeader title="Reviews" subtitle="You can reply once to each review" />
      {!data.length ? <Empty title="No reviews yet" /> : (
        <div className="space-y-3">
          {data.map((r) => (
            <ReviewCard key={r.id} r={r}>
              {!r.reply && (
                <div className="mt-3 flex gap-2">
                  <input className="input" placeholder="Write a public reply" value={text[r.id] || ""} onChange={(e) => setText({ ...text, [r.id]: e.target.value })} />
                  <button className="btn-primary" disabled={!text[r.id]} onClick={() => act.mutate({ id: r.id, a: "reply", body: { reply: text[r.id] } })}>Reply</button>
                  {!r.reported && <button className="btn-secondary" onClick={() => act.mutate({ id: r.id, a: "report" })}>Report</button>}
                </div>
              )}
            </ReviewCard>
          ))}
        </div>
      )}
    </div>
  );
}
