import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, listOf } from "../../api/client";
import { Empty, PageHeader, PageLoader } from "../../components/ui";
import { dateTime } from "../../lib/format";

export default function Notifications({ embedded }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => api.get("/notifications/?page_size=100").then((r) => listOf(r.data)) });
  const readAll = useMutation({
    mutationFn: () => api.post("/notifications/read-all/"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["unread"] }); },
  });
  return (
    <div className={embedded ? "" : "mx-auto max-w-3xl px-4 py-8"}>
      <PageHeader title="Notifications" actions={<button className="btn-secondary btn-sm" onClick={() => readAll.mutate()}>Mark all read</button>} />
      {isLoading ? <PageLoader /> : !data.length ? <Empty title="No notifications" /> : (
        <div className="space-y-2">
          {data.map((n) => (
            <div key={n.id} className={`card py-3 ${!n.read_at ? "border-l-4 border-l-brand-600" : ""}`}>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="mt-1 text-xs text-slate-400">{dateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
