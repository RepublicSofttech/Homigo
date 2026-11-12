import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, errorMessage, listOf, toFormData } from "../../api/client";
import { Badge, DataTable, Field, Modal, PageHeader, PageLoader } from "../../components/ui";
import { titleCase } from "../../lib/format";

const DOCS = ["id_proof", "police_verification", "address_proof", "driving_licence", "skill_certificate", "medical_fitness", "other"];

function CoworkerForm({ coworker, services, onClose, onSaved }) {
  const { register, handleSubmit } = useForm({ defaultValues: coworker ? { ...coworker, skill_ids: coworker.skill_ids.map(String) } : { skill_level: "skilled", experience_years: 1, max_jobs_per_day: 6 } });
  const save = useMutation({
    mutationFn: (v) => {
      const body = { ...v, skill_ids: (v.skill_ids || []).map(Number), date_of_birth: v.date_of_birth || null };
      ["documents", "photo", "partner_name", "skill_names"].forEach((k) => delete body[k]);
      return coworker ? api.patch(`/partner/coworkers/${coworker.id}/`, body) : api.post("/partner/coworkers/", body);
    },
    onSuccess: () => { toast.success("Saved"); onSaved(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal open onClose={onClose} title={coworker ? "Edit coworker" : "Add coworker"} wide>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name *"><input className="input" {...register("name", { required: true })} /></Field>
        <Field label="Mobile *" hint="They log in with this number"><input className="input" {...register("phone", { required: true })} /></Field>
        <Field label="Gender"><select className="input" {...register("gender")}><option value="">-</option><option value="male">Male</option><option value="female">Female</option></select></Field>
        <Field label="Date of birth"><input type="date" className="input" {...register("date_of_birth")} /></Field>
        <Field label="Experience (years)"><input type="number" step="0.5" className="input" {...register("experience_years")} /></Field>
        <Field label="Skill level"><select className="input" {...register("skill_level")}><option value="helper">Helper</option><option value="skilled">Skilled</option><option value="expert">Expert</option></select></Field>
        <Field label="Languages"><input className="input" {...register("languages")} /></Field>
        <Field label="Emergency contact"><input className="input" {...register("emergency_contact")} /></Field>
        <Field label="Govt ID number" hint={coworker?.id_number_masked ? `Saved: ${coworker.id_number_masked}` : "Stored masked + hashed"}><input className="input" {...register("id_number")} /></Field>
        <Field label="Max jobs per day"><input type="number" className="input" {...register("max_jobs_per_day")} /></Field>
        <div className="sm:col-span-2">
          <Field label="Skills (hold Ctrl/Cmd to select many) *">
            <select multiple className="input h-28" {...register("skill_ids")}>{services.map((s) => <option key={s.service} value={s.service}>{s.service_name}</option>)}</select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary">Save</button></div>
      </form>
    </Modal>
  );
}

function CoworkerDocs({ coworker, onClose, onChanged }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { doc_type: "id_proof" } });
  const up = useMutation({
    mutationFn: (v) => api.post("/partner/coworker-documents/", toFormData({ ...v, coworker: coworker.id })),
    onSuccess: () => { toast.success("Uploaded"); reset({ doc_type: "id_proof" }); onChanged(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const submit = useMutation({
    mutationFn: () => api.post(`/partner/coworkers/${coworker.id}/submit/`),
    onSuccess: () => { toast.success("Sent for verification"); onChanged(); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal open onClose={onClose} title={`Documents – ${coworker.name}`} wide>
      <div className="mb-4 space-y-1 text-sm">
        {coworker.documents.length ? coworker.documents.map((d) => (
          <p key={d.id} className="flex items-center justify-between rounded border p-2">
            <span>{titleCase(d.doc_type)} {d.number_masked}</span>
            <span className="flex items-center gap-2"><Badge status={d.status} /><a href={d.file} target="_blank" rel="noreferrer" className="text-brand-600">View</a></span>
          </p>
        )) : <p className="text-slate-500">No documents yet.</p>}
      </div>
      <form onSubmit={handleSubmit((v) => up.mutate(v))} className="grid gap-3 sm:grid-cols-2">
        <Field label="Type"><select className="input" {...register("doc_type")}>{DOCS.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}</select></Field>
        <Field label="Number"><input className="input" {...register("number")} /></Field>
        <Field label="Expiry"><input type="date" className="input" {...register("expiry_date")} /></Field>
        <Field label="File *"><input type="file" className="input" accept=".pdf,image/*" {...register("file", { required: true })} /></Field>
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-secondary">Upload</button>
          {["draft", "resubmission_required", "rejected"].includes(coworker.verification_status) && (
            <button type="button" className="btn-primary" onClick={() => submit.mutate()}>Submit for verification</button>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default function Team() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState(null);
  const [docs, setDocs] = useState(null);
  const list = useQuery({ queryKey: ["coworkers"], queryFn: () => api.get("/partner/coworkers/?page_size=200").then((r) => listOf(r.data)) });
  const services = useQuery({ queryKey: ["partner-services"], queryFn: () => api.get("/partner/services/").then((r) => r.data) });
  const act = useMutation({
    mutationFn: ({ id, a }) => api.post(`/partner/coworkers/${id}/${a}/`),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["coworkers"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["coworkers"] });
  if (list.isLoading) return <PageLoader />;
  const current = docs && list.data.find((c) => c.id === docs);
  return (
    <div>
      <PageHeader title="Team" subtitle="Coworkers must be verified by HomeServ before they can get jobs" actions={<button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" /> Add coworker</button>} />
      <DataTable rows={list.data} empty="No coworkers yet" columns={[
        { key: "name", label: "Name", render: (c) => <div><p className="font-medium">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></div> },
        { key: "skill_names", label: "Skills", render: (c) => c.skill_names.join(", ") || "-" },
        { key: "verification_status", label: "Verification", render: (c) => <Badge status={c.verification_status} /> },
        { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
        { key: "rating_avg", label: "Rating", render: (c) => `★ ${Number(c.rating_avg).toFixed(1)} · ${c.jobs_completed} jobs` },
        { key: "a", label: "", render: (c) => (
          <div className="flex flex-wrap justify-end gap-1">
            <button className="btn-secondary btn-sm" onClick={() => setDocs(c.id)}>Documents</button>
            <button className="btn-secondary btn-sm" onClick={() => setEdit(c)}>Edit</button>
            {c.status === "active" ? <button className="btn-secondary btn-sm" onClick={() => act.mutate({ id: c.id, a: "deactivate" })}>Deactivate</button>
              : c.verification_status === "approved" && c.status === "inactive" && <button className="btn-success btn-sm" onClick={() => act.mutate({ id: c.id, a: "activate" })}>Activate</button>}
          </div>
        ) },
      ]} />
      {edit && <CoworkerForm coworker={edit.id ? edit : null} services={services.data || []} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refresh(); }} />}
      {current && <CoworkerDocs coworker={current} onClose={() => setDocs(null)} onChanged={refresh} />}
    </div>
  );
}
