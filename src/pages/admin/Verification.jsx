import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage, listOf } from "../../api/client";
import { Badge, DataTable, Modal, PageHeader, PageLoader, Tabs } from "../../components/ui";
import { dateTime, titleCase } from "../../lib/format";

function Docs({ caseId, docs, onChanged }) {
  const m = useMutation({
    mutationFn: ({ id, status, reason }) => api.post(`/admin/verification-cases/${caseId}/documents/${id}/decision/`, { status, reason }),
    onSuccess: onChanged,
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="space-y-2">
      {docs.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm">
          <span>{titleCase(d.doc_type)} {d.number_masked} {d.expiry_date && `· exp ${d.expiry_date}`} <Badge status={d.status} /></span>
          <span className="flex gap-1">
            <a className="btn-secondary btn-sm" href={d.file} target="_blank" rel="noreferrer">View</a>
            <button className="btn-success btn-sm" onClick={() => m.mutate({ id: d.id, status: "verified" })}>Verify</button>
            <button className="btn-secondary btn-sm text-red-600" onClick={() => { const r = prompt("Reason (e.g. blurred image, name mismatch)"); r && m.mutate({ id: d.id, status: "rejected", reason: r }); }}>Reject</button>
          </span>
        </div>
      ))}
      {!docs.length && <p className="text-sm text-red-600">No documents uploaded</p>}
    </div>
  );
}

function CaseView({ c, onClose, onChanged }) {
  const [note, setNote] = useState("");
  const act = useMutation({
    mutationFn: (a) => api.post(`/admin/verification-cases/${c.id}/${a}/`, { note }),
    onSuccess: (_, a) => { toast.success(`Case ${a}`); onChanged(); if (a !== "claim") onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const p = c.partner_detail;
  const w = c.coworker_detail;
  const closed = ["approved", "rejected"].includes(c.status);
  return (
    <Modal open onClose={onClose} title={`${titleCase(c.subject_type)} verification – ${c.subject_name}`} wide>
      <div className="space-y-4 text-sm">
        <p>Status: <Badge status={c.status} /> · SLA due {dateTime(c.sla_due)} {c.assigned_to_name && `· Reviewer: ${c.assigned_to_name}`}</p>
        {p && (
          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
            <p><b>Legal name:</b> {p.legal_name}</p><p><b>Display:</b> {p.display_name}</p>
            <p><b>Type:</b> {titleCase(p.entity_type)}</p><p><b>Owner phone:</b> {p.owner_phone}</p>
            <p><b>PAN:</b> {p.pan_masked || "-"}</p><p><b>GSTIN:</b> {p.gstin || "-"}</p>
            <p className="sm:col-span-2"><b>Address:</b> {p.address_line}, {p.city} {p.pincode} ({p.latitude}, {p.longitude})</p>
            <p className="sm:col-span-2"><b>Bank:</b> {p.bank_account ? `${p.bank_account.account_holder} · ${p.bank_account.bank_name} ${p.bank_account.account_masked} · ${p.bank_account.ifsc}` : "Not added"}</p>
          </div>
        )}
        {w && (
          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
            <p><b>Name:</b> {w.name}</p><p><b>Phone:</b> {w.phone}</p>
            <p><b>Partner:</b> {w.partner_name}</p><p><b>Skills:</b> {w.skill_names.join(", ")}</p>
            <p><b>Experience:</b> {w.experience_years} yrs · {w.skill_level}</p><p><b>ID:</b> {w.id_number_masked || "-"}</p>
          </div>
        )}
        <div>
          <h4 className="mb-2 font-semibold">Documents</h4>
          <Docs caseId={c.id} docs={p ? p.documents : w.documents} onChanged={onChanged} />
        </div>
        {!closed && (
          <>
            <textarea className="input" rows={2} placeholder="Note / reason (required for reject or resubmission)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {c.status === "open" && <button className="btn-secondary" onClick={() => act.mutate("claim")}>Claim case</button>}
              <button className="btn-success" onClick={() => act.mutate("approve")}>Approve</button>
              <button className="btn-secondary" onClick={() => act.mutate("resubmit")}>Ask resubmission</button>
              <button className="btn-danger" onClick={() => act.mutate("reject")}>Reject</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function Verification() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("open");
  const [view, setView] = useState(null);
  const status = { open: "open", in_review: "in_review", closed: "" }[tab];
  const { data, isLoading } = useQuery({
    queryKey: ["cases", tab],
    queryFn: () => api.get(`/admin/verification-cases/?page_size=100${status ? `&status=${status}` : ""}`).then((r) => listOf(r.data)),
  });
  const rows = tab === "closed" ? (data || []).filter((c) => !["open", "in_review"].includes(c.status)) : data || [];
  const current = rows.find((c) => c.id === view);
  return (
    <div>
      <PageHeader title="Verification queue" subtitle="Approve partners and coworkers before they can work" />
      <Tabs tabs={["open", "in_review", "closed"]} value={tab} onChange={setTab} />
      {isLoading ? <PageLoader /> : <DataTable rows={rows} onRowClick={(c) => setView(c.id)} empty="Queue is empty" columns={[
        { key: "id", label: "#" }, { key: "subject_type", label: "Type", render: (c) => titleCase(c.subject_type) },
        { key: "subject_name", label: "Name" }, { key: "created_at", label: "Submitted", render: (c) => dateTime(c.created_at) },
        { key: "sla_due", label: "SLA due", render: (c) => <span className={new Date(c.sla_due) < new Date() && !["approved", "rejected"].includes(c.status) ? "font-semibold text-red-600" : ""}>{dateTime(c.sla_due)}</span> },
        { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
      ]} />}
      {current && <CaseView c={current} onClose={() => setView(null)} onChanged={() => qc.invalidateQueries({ queryKey: ["cases"] })} />}
    </div>
  );
}
