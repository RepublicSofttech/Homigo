import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, errorCode, errorMessage, listOf, toFormData } from "../../api/client";
import { Badge, DataTable, Field, PageHeader, PageLoader, Tabs } from "../../components/ui";
import { useLocation2 } from "../../context/LocationContext";
import { titleCase } from "../../lib/format";

const DOC_TYPES = ["pan", "aadhaar", "gst", "business_proof", "address_proof", "cancelled_cheque", "service_licence", "agreement", "other"];

function ProfileTab({ profile, onSaved }) {
  const { detect } = useLocation2();
  const { register, handleSubmit, setValue } = useForm({ defaultValues: profile || { entity_type: "individual", service_radius_km: 5, working_hours_start: "08:00", working_hours_end: "20:00", accepts_cash: true } });
  const save = useMutation({
    mutationFn: (v) => {
      const body = { ...v };
      delete body.logo;
      body.holiday_until = body.holiday_until || null;
      ["years_in_business", "service_radius_km"].forEach((k) => body[k] === "" && delete body[k]);
      return profile ? api.patch("/partner/profile/", body) : api.post("/partner/profile/", body);
    },
    onSuccess: () => { toast.success("Profile saved"); onSaved(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="card grid gap-4 sm:grid-cols-2">
      <Field label="Legal / business name *"><input className="input" {...register("legal_name", { required: true })} /></Field>
      <Field label="Display name (shown to customers) *"><input className="input" {...register("display_name", { required: true })} /></Field>
      <Field label="Business type"><select className="input" {...register("entity_type")}>{["individual", "proprietorship", "partnership", "llp", "pvt_ltd"].map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</select></Field>
      <Field label="Years in business"><input type="number" className="input" {...register("years_in_business")} /></Field>
      <div className="sm:col-span-2"><Field label="About your business"><textarea className="input" rows={2} {...register("description")} /></Field></div>
      <Field label="PAN number" hint={profile?.pan_masked ? `Saved: ${profile.pan_masked}` : "Stored masked (last 4 digits)"}><input className="input uppercase" {...register("pan_number")} /></Field>
      <Field label="GSTIN (if registered)"><input className="input uppercase" {...register("gstin")} /></Field>
      <div className="sm:col-span-2"><Field label="Base address *"><input className="input" {...register("address_line", { required: true })} /></Field></div>
      <Field label="City *"><input className="input" {...register("city", { required: true })} /></Field>
      <Field label="Pincode *"><input className="input" {...register("pincode", { required: true })} /></Field>
      <Field label="Latitude *"><input className="input" {...register("latitude", { required: true })} /></Field>
      <Field label="Longitude *"><input className="input" {...register("longitude", { required: true })} /></Field>
      <button type="button" className="btn-secondary sm:col-span-2" onClick={() => detect().then((l) => { setValue("latitude", l.lat); setValue("longitude", l.lng); toast.success("Location captured"); }).catch((e) => toast.error(e.message))}>Use my current GPS location</button>
      <Field label="Service radius (km)"><input type="number" step="0.5" className="input" {...register("service_radius_km")} /></Field>
      <Field label="Languages"><input className="input" {...register("languages")} /></Field>
      <Field label="Working hours start"><input type="time" className="input" {...register("working_hours_start")} /></Field>
      <Field label="Working hours end"><input type="time" className="input" {...register("working_hours_end")} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("accepts_cash")} /> Accept cash payments</label>
      <Field label="Holiday until (stop new bookings)"><input type="date" className="input" {...register("holiday_until")} /></Field>
      <div className="sm:col-span-2"><button className="btn-primary" disabled={save.isPending}>Save profile</button></div>
    </form>
  );
}

function ServicesTab() {
  const qc = useQueryClient();
  const all = useQuery({ queryKey: ["services", "all"], queryFn: () => api.get("/services/?page_size=200").then((r) => listOf(r.data)) });
  const mine = useQuery({ queryKey: ["partner-services"], queryFn: () => api.get("/partner/services/").then((r) => r.data) });
  const toggle = useMutation({
    mutationFn: ({ svc, row }) => (row ? api.patch(`/partner/services/${row.id}/`, { is_active: !row.is_active }) : api.post("/partner/services/", { service: svc })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-services"] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (all.isLoading || mine.isLoading) return <PageLoader />;
  return (
    <div className="card">
      <p className="mb-4 text-sm text-slate-500">Select the services you provide. Then add prices in Rate card and coworkers with these skills in Team.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {all.data.map((s) => {
          const row = mine.data.find((m) => m.service === s.id);
          const on = row?.is_active;
          return (
            <button key={s.id} onClick={() => toggle.mutate({ svc: s.id, row })} className={`rounded-lg border p-3 text-left text-sm ${on ? "border-brand-600 bg-brand-50" : "border-slate-200"}`}>
              <p className="font-medium">{on ? "✓ " : ""}{s.name}</p>
              <p className="text-xs text-slate-500">{s.category_name} · min {s.min_coworkers} coworker(s)</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsTab() {
  const qc = useQueryClient();
  const docs = useQuery({ queryKey: ["partner-docs"], queryFn: () => api.get("/partner/documents/").then((r) => r.data) });
  const { register, handleSubmit, reset } = useForm({ defaultValues: { doc_type: "pan" } });
  const up = useMutation({
    mutationFn: (v) => api.post("/partner/documents/", toFormData(v)),
    onSuccess: () => { toast.success("Uploaded"); reset({ doc_type: "pan" }); qc.invalidateQueries({ queryKey: ["partner-docs"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit((v) => up.mutate(v))} className="card grid gap-3 sm:grid-cols-4">
        <Field label="Document type"><select className="input" {...register("doc_type")}>{DOC_TYPES.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}</select></Field>
        <Field label="Number (stored masked)"><input className="input" {...register("number")} /></Field>
        <Field label="Expiry (if any)"><input type="date" className="input" {...register("expiry_date")} /></Field>
        <Field label="File (PDF/JPG, max 5MB) *"><input type="file" accept=".pdf,image/*" className="input" {...register("file", { required: true })} /></Field>
        <div className="sm:col-span-4"><button className="btn-primary" disabled={up.isPending}>Upload</button></div>
      </form>
      <DataTable rows={docs.data || []} columns={[
        { key: "doc_type", label: "Type", render: (d) => titleCase(d.doc_type) }, { key: "number_masked", label: "Number" },
        { key: "expiry_date", label: "Expiry" }, { key: "status", label: "Status", render: (d) => <Badge status={d.status} /> },
        { key: "reason", label: "Remark" }, { key: "file", label: "File", render: (d) => <a href={d.file} target="_blank" rel="noreferrer" className="text-brand-600">View</a> },
      ]} />
    </div>
  );
}

function BankTab() {
  const bank = useQuery({ queryKey: ["partner-bank"], queryFn: () => api.get("/partner/bank-account/").then((r) => r.data) });
  const { register, handleSubmit } = useForm();
  const save = useMutation({
    mutationFn: (v) => api.put("/partner/bank-account/", v),
    onSuccess: () => { toast.success("Bank details saved"); bank.refetch(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="card max-w-xl">
      {bank.data && <p className="mb-4 text-sm">Saved: <b>{bank.data.bank_name} {bank.data.account_masked}</b> ({bank.data.ifsc}) <Badge status={bank.data.is_verified ? "verified" : "pending"} /></p>}
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-3 sm:grid-cols-2">
        <Field label="Account holder name *"><input className="input" {...register("account_holder", { required: true })} /></Field>
        <Field label="Account number *"><input className="input" {...register("account_number", { required: true })} /></Field>
        <Field label="IFSC *"><input className="input uppercase" {...register("ifsc", { required: true })} /></Field>
        <Field label="Bank name"><input className="input" {...register("bank_name")} /></Field>
        <Field label="UPI ID"><input className="input" {...register("upi_id")} /></Field>
        <div className="sm:col-span-2"><button className="btn-primary">{bank.data ? "Update" : "Save"} bank account</button></div>
      </form>
    </div>
  );
}

function SubmitTab({ profile, onDone }) {
  const status = useQuery({ queryKey: ["go-live"], queryFn: () => api.get("/partner/go-live-status/").then((r) => r.data) });
  const submit = useMutation({
    mutationFn: () => api.post("/partner/submit-verification/"),
    onSuccess: () => { toast.success("Submitted for verification"); onDone(); status.refetch(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h3 className="font-semibold">Verification</h3>
        <p className="mt-2 text-sm">Current status: <Badge status={profile.verification_status} /></p>
        {profile.rejection_reason && <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">Admin remark: {profile.rejection_reason}</p>}
        {["draft", "resubmission_required", "rejected"].includes(profile.verification_status) && (
          <button className="btn-primary mt-4" onClick={() => submit.mutate()} disabled={submit.isPending}>Submit for verification</button>
        )}
        <p className="mt-3 text-xs text-slate-500">Our team verifies within 48 working hours.</p>
      </div>
      <div className="card">
        <h3 className="mb-3 font-semibold">Go-live checklist</h3>
        {status.data?.checks.map((c) => (
          <p key={c.label} className="flex items-center gap-2 py-1 text-sm">
            {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />} {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [tab, setTab] = useState("profile");
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["partner-profile"], queryFn: () => api.get("/partner/profile/").then((r) => r.data).catch((e) => { if (errorCode(e) === "PARTNER_PROFILE_MISSING") return null; throw e; }) });
  if (profile.isLoading) return <PageLoader />;
  const p = profile.data;
  const refresh = () => { qc.invalidateQueries({ queryKey: ["partner-profile"] }); qc.invalidateQueries({ queryKey: ["partner-dashboard"] }); };
  return (
    <div>
      <PageHeader title="Business onboarding" subtitle="Profile → Services → Documents → Bank → Submit" />
      <Tabs tabs={p ? ["profile", "services", "documents", "bank", "submit"] : ["profile"]} value={tab} onChange={setTab} />
      {tab === "profile" && <ProfileTab profile={p} onSaved={() => { refresh(); if (!p) setTab("services"); }} />}
      {tab === "services" && <ServicesTab />}
      {tab === "documents" && <DocumentsTab />}
      {tab === "bank" && <BankTab />}
      {tab === "submit" && <SubmitTab profile={p} onDone={refresh} />}
    </div>
  );
}
