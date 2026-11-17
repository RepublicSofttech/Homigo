import { useQuery } from "@tanstack/react-query";
import { Bot, MessageSquare, ThumbsUp, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../../api/client";
import { ASSIST_URL } from "../../components/AssistWidget";
import { Badge, DataTable, Empty, Modal, PageHeader, PageLoader, StatCard } from "../../components/ui";
import { dateTime } from "../../lib/format";

async function assist(path, opts = {}) {
  const r = await fetch(`${ASSIST_URL}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Token ${getToken()}`, ...(opts.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || "Assist service error");
  return d;
}

/** Staff view of Homigo Assist chats: summaries, escalations, full transcripts (read-only). */
export default function AssistChats() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const list = useQuery({
    queryKey: ["assist-sessions", status, q],
    queryFn: () => assist(`/api/admin/sessions/?status=${status}&q=${encodeURIComponent(q)}`),
    enabled: !!ASSIST_URL,
    refetchInterval: 30000,
  });

  if (!ASSIST_URL) return <Empty title="Chat service not configured" text="Set VITE_ASSIST_URL for the frontend." />;
  const st = list.data?.stats || {};
  return (
    <div>
      <PageHeader title="Chat sessions" subtitle="Homigo Assist conversations. Escalated chats also create a support ticket with the summary." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Chats today" value={st.today ?? "–"} icon={MessageSquare} />
        <StatCard label="Escalated today" value={st.escalated ?? "–"} icon={TriangleAlert} tone="amber" />
        <StatCard label="Helpful answers" value={st.helpful_total ? `${Math.round((st.helpful_up / st.helpful_total) * 100)}%` : "–"} hint={`${st.helpful_total || 0} ratings`} icon={ThumbsUp} tone="green" />
        <StatCard label="Total (filtered)" value={list.data?.count ?? "–"} icon={Bot} />
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="escalated">Escalated</option>
          <option value="closed">Closed</option>
        </select>
        <input className="input max-w-xs" placeholder="Search text, name, summary…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.isLoading ? <PageLoader /> : list.isError ? <Empty title="Couldn't load chats" text={list.error.message} /> : (
        <DataTable rows={list.data.results} onRowClick={(r) => setOpen(r.id)} columns={[
          { key: "updated_at", label: "Last activity", render: (r) => dateTime(r.updated_at) },
          { key: "role", label: "User", render: (r) => <span>{r.user_name || "Guest"} <span className="text-xs text-slate-400">({r.role})</span></span> },
          { key: "first_message", label: "First message", render: (r) => <span className="line-clamp-1 max-w-xs text-sm">{r.first_message || "—"}</span> },
          { key: "language", label: "Lang" },
          { key: "message_count", label: "Msgs" },
          { key: "rating", label: "Rating", render: (r) => (r.rating ? "★".repeat(r.rating) : "—") },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status === "escalated" ? "pending" : r.status === "open" ? "active" : "inactive"}>{r.status}</Badge> },
          { key: "ticket_id", label: "Ticket", render: (r) => (r.ticket_id ? `#${r.ticket_id}` : "—") },
        ]} />
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title="Chat details" wide>{open && <ChatDetail id={open} />}</Modal>
    </div>
  );
}

function ChatDetail({ id }) {
  const d = useQuery({ queryKey: ["assist-session", id], queryFn: () => assist(`/api/admin/sessions/${id}/`) });
  if (d.isLoading) return <PageLoader />;
  if (d.isError) return <Empty title="Couldn't load" text={d.error.message} />;
  const { session: s, messages, actions } = d.data;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <p><span className="text-slate-500">User:</span> {s.user_name || "Guest"} ({s.role})</p>
        <p><span className="text-slate-500">Language:</span> {s.language}</p>
        <p><span className="text-slate-500">Ticket:</span> {s.ticket_id ? <Link className="text-brand-600" to="/admin/tickets">#{s.ticket_id}</Link> : "—"}</p>
      </div>
      <div className="rounded-xl bg-amber-50 p-4">
        <p className="mb-1 text-sm font-semibold text-amber-800">Summary {s.summary_reason && <span className="font-normal">· {s.summary_reason}</span>}</p>
        <p className="whitespace-pre-line text-sm text-slate-700">{s.summary || "No summary yet (created when the chat ends or is escalated)."}</p>
        {s.feedback && <p className="mt-2 text-sm text-slate-600">Feedback: “{s.feedback}”</p>}
      </div>
      {actions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Actions</p>
          <ul className="space-y-1 text-sm">{actions.map((a, i) => <li key={i}>• {a.title} — <b>{a.status}</b> <span className="text-xs text-slate-400">{dateTime(a.created_at)}</span></li>)}</ul>
        </div>
      )}
      <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-4">
        {messages.map((m) => m.role === "system" ? (
          <p key={m.id} className="text-center text-xs text-slate-400">{m.text}</p>
        ) : (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-white ring-1 ring-slate-200"}`}>
              {m.ui?.display || m.text}
              {m.helpful !== null && m.helpful !== undefined && <span className="ml-2">{m.helpful ? "👍" : "👎"}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
