import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage, listOf } from "../../api/client";
import CrudPage from "../../components/ui/CrudPage";
import { Badge, DataTable, Modal, PageHeader, PageLoader, Tabs } from "../../components/ui";
import { dateOnly, dateTime, money, titleCase } from "../../lib/format";
import { ReviewCard } from "../partner/Reviews";

const useList = (key, url) => useQuery({ queryKey: [key], queryFn: () => api.get(url).then((r) => listOf(r.data)) });

function useAction(keys) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ url, body }) => api.post(url, body || {}),
    onSuccess: () => { toast.success("Done"); keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function Partners() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-partners", q], queryFn: () => api.get(`/admin/partners/?page_size=100&search=${q}`).then((r) => listOf(r.data)) });
  const [view, setView] = useState(null);
  const act = useAction(["admin-partners"]);
  const live = useQuery({ queryKey: ["go-live", view?.id], queryFn: () => api.get(`/admin/partners/${view.id}/go-live/`).then((r) => r.data), enabled: !!view });
  return (
    <div>
      <PageHeader title="Area partners" actions={<input className="input w-60" placeholder="Search name / phone / city" onKeyDown={(e) => e.key === "Enter" && setQ(e.target.value)} />} />
      {isLoading ? <PageLoader /> : <DataTable rows={data} onRowClick={setView} columns={[
        { key: "display_name", label: "Partner", render: (p) => <div><p className="font-medium">{p.display_name}</p><p className="text-xs text-slate-500">{p.owner_phone}</p></div> },
        { key: "city", label: "City" }, { key: "coworker_count", label: "Team" },
        { key: "subscription", label: "Plan", render: (p) => p.subscription ? `${p.subscription.plan} (till ${p.subscription.end_date})` : <span className="text-red-600">None</span> },
        { key: "rating_avg", label: "Rating", render: (p) => `★ ${Number(p.rating_avg).toFixed(1)} (${p.rating_count})` },
        { key: "verification_status", label: "Verification", render: (p) => <Badge status={p.verification_status} /> },
        { key: "account_status", label: "Account", render: (p) => <Badge status={p.account_status} /> },
      ]} />}
      {view && (
        <Modal open onClose={() => setView(null)} title={view.display_name} wide>
          <div className="space-y-3 text-sm">
            <p>{view.legal_name} · {titleCase(view.entity_type)} · {view.address_line}, {view.city} {view.pincode}</p>
            <p>Radius {view.service_radius_km} km · Jobs {view.jobs_completed} · Joined {dateOnly(view.created_at)}</p>
            <h4 className="font-semibold">Go-live checklist</h4>
            {live.data?.checks.map((c) => <p key={c.label} className="flex items-center gap-2">{c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}{c.label}</p>)}
            <div className="flex gap-2 pt-2">
              {view.account_status === "active"
                ? <button className="btn-danger" onClick={() => { const r = prompt("Reason for suspension"); r && act.mutate({ url: `/admin/partners/${view.id}/suspend/`, body: { reason: r } }); setView(null); }}>Suspend</button>
                : <button className="btn-success" onClick={() => { act.mutate({ url: `/admin/partners/${view.id}/reactivate/` }); setView(null); }}>Reactivate</button>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Coworkers() {
  const { data, isLoading } = useList("admin-coworkers", "/admin/coworkers/?page_size=200");
  const act = useAction(["admin-coworkers"]);
  const doAct = (c, a) => { const r = prompt(`Reason to ${a} ${c.name}`); if (r) act.mutate({ url: `/admin/coworkers/${c.id}/${a}/`, body: { reason: r } }); };
  return (
    <div>
      <PageHeader title="Coworker directory" subtitle="All field professionals across partners" />
      {isLoading ? <PageLoader /> : <DataTable rows={data} columns={[
        { key: "name", label: "Name", render: (c) => <div><p className="font-medium">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></div> },
        { key: "partner_name", label: "Partner" }, { key: "skill_names", label: "Skills", render: (c) => c.skill_names.join(", ") },
        { key: "verification_status", label: "Verification", render: (c) => <Badge status={c.verification_status} /> },
        { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
        { key: "a", label: "", render: (c) => c.status !== "blacklisted" && (
          <div className="flex gap-1"><button className="btn-secondary btn-sm" onClick={() => doAct(c, "suspend")}>Suspend</button><button className="btn-danger btn-sm" onClick={() => doAct(c, "blacklist")}>Blacklist</button></div>
        ) },
      ]} />}
    </div>
  );
}

const BT = ["instant", "scheduled", "hourly", "recurring", "quote", "rental", "delivery"];
const ICONS = ["wrench", "sparkles", "shield", "heart", "party", "droplet", "truck", "zap"];

export function Catalogue() {
  const [tab, setTab] = useState("categories");
  const cats = useQuery({ queryKey: ["/categories/"], queryFn: () => api.get("/categories/").then((r) => r.data) });
  const svcs = useQuery({ queryKey: ["/services/", "all"], queryFn: () => api.get("/services/?page_size=500").then((r) => listOf(r.data)) });
  const catOpts = (cats.data || []).map((c) => ({ value: c.id, label: c.name }));
  const svcOpts = (svcs.data || []).map((s) => ({ value: s.id, label: s.name }));
  return (
    <div>
      <Tabs tabs={["categories", "services", "items"]} value={tab} onChange={setTab} />
      {tab === "categories" && <CrudPage title="Categories" endpoint="/categories/" canDelete={false}
        columns={[{ key: "name", label: "Name" }, { key: "icon", label: "Icon" }, { key: "service_count", label: "Services" }, { key: "is_active", label: "Active", render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> }]}
        fields={[{ name: "name", label: "Name", required: true }, { name: "icon", label: "Icon", type: "select", options: ICONS.map((i) => ({ value: i, label: i })) }, { name: "sort_order", label: "Sort order", type: "number" }, { name: "is_active", label: "Active", type: "checkbox" }, { name: "description", label: "Description", type: "textarea" }]}
        defaults={{ is_active: true, sort_order: 0 }} />}
      {tab === "services" && <CrudPage title="Services" endpoint="/services/" queryParams="?page_size=500" canDelete={false}
        columns={[{ key: "name", label: "Service" }, { key: "category_name", label: "Category" }, { key: "booking_types", label: "Booking types", render: (r) => r.booking_types.join(", ") }, { key: "radius_km", label: "Radius km" }, { key: "min_coworkers", label: "Min team" }, { key: "is_active", label: "Active", render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> }]}
        fields={[
          { name: "name", label: "Name", required: true }, { name: "category", label: "Category", type: "select", options: catOpts, required: true },
          { name: "booking_types", label: "Booking types", type: "multiselect", options: BT.map((b) => ({ value: b, label: b })) },
          { name: "icon", label: "Icon", type: "select", options: ICONS.map((i) => ({ value: i, label: i })) },
          { name: "synonyms", label: "Search synonyms (comma separated)" }, { name: "radius_km", label: "Radius (km)", type: "number" },
          { name: "min_coworkers", label: "Min approved coworkers to go live", type: "number" }, { name: "warranty_days", label: "Warranty days", type: "number" },
          { name: "visit_charge", label: "Visit charge (₹)", type: "number" }, { name: "commission_override", label: "Commission override %", type: "number", hint: "Empty = plan commission" },
          { name: "is_active", label: "Active", type: "checkbox" }, { name: "gender_preference_allowed", label: "Gender preference allowed", type: "checkbox" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "questions", label: "Customer questions (JSON)", type: "json", hint: '[{"key":"ac_type","label":"AC type","options":["Split","Window"]}]' },
          { name: "supplies_mode", label: "Supplies kit", type: "select", options: [{ value: "none", label: "Customer provides" }, { value: "included", label: "Pro always brings kit" }, { value: "optional", label: "Customer can ask for kit" }] },
          { name: "supplies_charge", label: "Kit charge (₹, 0 = free)", type: "number" },
          { name: "supplies_list", label: "Kit items (JSON list)", type: "json", hint: '["Mop & bucket", "Floor cleaner"]' },
        ]}
        toForm={(v) => ({ ...v, booking_types: v.booking_types || [] })}
        fromForm={(p) => ({ ...p, booking_types: (p.booking_types || []).map(String) })}
        defaults={{ is_active: true, radius_km: 5, min_coworkers: 1, warranty_days: 7, visit_charge: 0, booking_types: ["scheduled"], supplies_mode: "none", supplies_charge: 0, supplies_list: [] }} />}
      {tab === "items" && <CrudPage title="Service items & price guard-rails" endpoint="/service-items/"
        columns={[{ key: "name", label: "Item" }, { key: "service", label: "Service", render: (r) => svcOpts.find((s) => s.value === r.service)?.label }, { key: "default_price", label: "Default", render: (r) => money(r.default_price) }, { key: "range", label: "Allowed range", render: (r) => `${money(r.price_floor)} – ${money(r.price_ceiling)}` }, { key: "unit_label", label: "Unit" }]}
        fields={[
          { name: "service", label: "Service", type: "select", options: svcOpts, required: true }, { name: "name", label: "Item name", required: true },
          { name: "pricing_model", label: "Pricing model", type: "select", options: ["fixed", "visit", "hourly", "shift", "unit", "package", "monthly", "quote"].map((v) => ({ value: v, label: v })) },
          { name: "unit_label", label: "Unit (job/hour/shift/sq.ft)" }, { name: "default_price", label: "Default price", type: "number", required: true },
          { name: "price_floor", label: "Min price", type: "number" }, { name: "price_ceiling", label: "Max price", type: "number" },
          { name: "duration_minutes", label: "Duration (min)", type: "number" }, { name: "min_qty", label: "Min qty", type: "number" },
          { name: "is_active", label: "Active", type: "checkbox" }, { name: "description", label: "Description", type: "textarea" },
        ]}
        defaults={{ pricing_model: "fixed", unit_label: "job", duration_minutes: 60, min_qty: 1, is_active: true }} />}
    </div>
  );
}

export function Plans() {
  return <CrudPage title="Subscription plans" endpoint="/plans/" canDelete={false}
    columns={[{ key: "name", label: "Plan" }, { key: "price", label: "Price", render: (r) => money(r.price) }, { key: "duration_days", label: "Days" }, { key: "commission_percent", label: "Commission %" }, { key: "max_coworkers", label: "Max team", render: (r) => r.max_coworkers ?? "Unlimited" }, { key: "is_active", label: "Active", render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> }]}
    fields={[
      { name: "name", label: "Name", required: true }, { name: "code", label: "Code (unique slug)", required: true },
      { name: "price", label: "Price (₹)", type: "number", required: true }, { name: "duration_days", label: "Duration (days)", type: "number", required: true },
      { name: "commission_percent", label: "Commission %", type: "number", required: true }, { name: "max_coworkers", label: "Max coworkers (empty = unlimited)", type: "number" },
      { name: "max_services", label: "Max services", type: "number" }, { name: "sort_order", label: "Sort", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" }, { name: "features", label: "Features (JSON list)", type: "json" }, { name: "description", label: "Description", type: "textarea" },
    ]}
    defaults={{ duration_days: 30, is_active: true, features: [] }} />;
}

export function OffersAdmin({ partner }) {
  const fields = [
    { name: "code", label: "Code", required: true }, { name: "title", label: "Title", required: true },
    { name: "discount_type", label: "Type", type: "select", options: [{ value: "flat", label: "Flat ₹" }, { value: "percent", label: "Percent %" }], required: true },
    { name: "value", label: "Value", type: "number", required: true }, { name: "max_discount", label: "Max discount (₹)", type: "number" },
    { name: "min_order_value", label: "Min order (₹)", type: "number" },
    { name: "valid_from", label: "Valid from", type: "datetime", required: true }, { name: "valid_to", label: "Valid to", type: "datetime", required: true },
    { name: "usage_limit", label: "Total usage limit", type: "number" }, { name: "per_user_limit", label: "Per customer limit", type: "number" },
    ...(partner ? [] : [{ name: "funded_by", label: "Funded by", type: "select", options: ["platform", "partner", "shared"].map((v) => ({ value: v, label: v })) }, { name: "partner_share_percent", label: "Partner share % (shared)", type: "number" }]),
    { name: "first_booking_only", label: "First booking only", type: "checkbox" }, { name: "is_active", label: "Active", type: "checkbox" },
    { name: "banner_color", label: "Banner colour", type: "color" }, { name: "description", label: "Description", type: "textarea" },
  ];
  return <CrudPage title={partner ? "My offers" : "Offers & coupons"} subtitle={partner ? "Partner-funded discounts for your customers" : undefined} endpoint={partner ? "/partner/offers/" : "/admin/offers/"}
    columns={[{ key: "code", label: "Code", render: (r) => <span className="font-mono font-bold">{r.code}</span> }, { key: "title", label: "Title" }, { key: "value", label: "Discount", render: (r) => (r.discount_type === "flat" ? money(r.value) : `${Number(r.value)}%`) }, { key: "funded_by", label: "Funded by" }, { key: "used_count", label: "Used" }, { key: "valid_to", label: "Valid till", render: (r) => dateOnly(r.valid_to) }, { key: "is_active", label: "Active", render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> }]}
    fields={fields}
    defaults={{ discount_type: "flat", per_user_limit: 1, min_order_value: 0, is_active: true, funded_by: "platform", partner_share_percent: 0, banner_color: "#4F46E5", valid_from: new Date().toISOString(), valid_to: new Date(Date.now() + 30 * 864e5).toISOString() }} />;
}

export function Finance() {
  const [tab, setTab] = useState("settlements");
  const settlements = useList("admin-settlements", "/admin/settlements/?page_size=100");
  const payments = useList("admin-payments", "/admin/payments/?page_size=100");
  const commissions = useList("admin-commissions", "/admin/commissions/?page_size=100");
  const subs = useList("admin-subs", "/admin/subscriptions/?page_size=100");
  const act = useAction(["admin-settlements", "admin-subs"]);
  return (
    <div>
      <PageHeader title="Finance" actions={tab === "settlements" && <button className="btn-primary" onClick={() => window.confirm("Create settlements for all partners with positive wallet balance?") && act.mutate({ url: "/admin/settlements/run/" })}>Run settlement</button>} />
      <Tabs tabs={["settlements", "payments", "commissions", "subscriptions"]} value={tab} onChange={setTab} />
      {tab === "settlements" && <DataTable rows={settlements.data} columns={[
        { key: "id", label: "#" }, { key: "partner_name", label: "Partner" }, { key: "amount", label: "Amount", render: (r) => money(r.amount) },
        { key: "created_at", label: "Created", render: (r) => dateTime(r.created_at) }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "utr", label: "UTR" },
        { key: "a", label: "", render: (r) => r.status === "pending" && <button className="btn-success btn-sm" onClick={() => { const utr = prompt("Bank UTR / reference"); utr && act.mutate({ url: `/admin/settlements/${r.id}/pay/`, body: { utr } }); }}>Mark paid</button> },
      ]} />}
      {tab === "payments" && <DataTable rows={payments.data} columns={[
        { key: "id", label: "#" }, { key: "purpose", label: "Purpose" }, { key: "booking_no", label: "Booking" }, { key: "amount", label: "Amount", render: (r) => money(r.amount) },
        { key: "gateway", label: "Gateway" }, { key: "gateway_payment_id", label: "Gateway ref" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "created_at", label: "Date", render: (r) => dateTime(r.created_at) },
      ]} />}
      {tab === "commissions" && <DataTable rows={commissions.data} columns={[
        { key: "booking_no", label: "Booking" }, { key: "partner_name", label: "Partner" }, { key: "payment_mode", label: "Mode" },
        { key: "service_value", label: "Service value", render: (r) => money(r.service_value) }, { key: "commission_amount", label: "Commission", render: (r) => `${money(r.commission_amount)} (${r.commission_percent}%)` },
        { key: "gst_on_commission", label: "GST", render: (r) => money(r.gst_on_commission) }, { key: "partner_net", label: "Partner net", render: (r) => money(r.partner_net) },
      ]} />}
      {tab === "subscriptions" && <DataTable rows={subs.data} columns={[
        { key: "partner_name", label: "Partner" }, { key: "plan", label: "Plan", render: (r) => r.plan_detail.name }, { key: "amount", label: "Amount", render: (r) => money(r.amount) },
        { key: "start_date", label: "From" }, { key: "end_date", label: "To" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        { key: "a", label: "", render: (r) => r.status === "pending_payment" && <button className="btn-secondary btn-sm" onClick={() => window.confirm("Activate without online payment (trial/offline)?") && act.mutate({ url: `/admin/subscriptions/${r.id}/grant/` })}>Grant</button> },
      ]} />}
    </div>
  );
}

export function ReviewsModeration() {
  const [reported, setReported] = useState(true);
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews", reported], queryFn: () => api.get(`/admin/reviews/?page_size=100${reported ? "&reported=true" : ""}`).then((r) => listOf(r.data)) });
  const act = useAction(["admin-reviews"]);
  return (
    <div>
      <PageHeader title="Reviews moderation" subtitle="Only remove reviews that break policy (abuse, personal data, spam) — never for being negative" actions={<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reported} onChange={(e) => setReported(e.target.checked)} /> Reported only</label>} />
      {isLoading ? <PageLoader /> : data.map((r) => (
        <div key={r.id} className="mb-3">
          <ReviewCard r={r}>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge status={r.is_published ? "active" : "inactive"}>{r.is_published ? "Published" : "Hidden"}</Badge>
              <button className="btn-secondary btn-sm" onClick={() => { const n = prompt("Policy reason"); n && act.mutate({ url: `/admin/reviews/${r.id}/moderate/`, body: { publish: !r.is_published, note: n } }); }}>{r.is_published ? "Hide" : "Publish"}</button>
              {r.moderation_note && <span className="text-xs text-slate-500">Note: {r.moderation_note}</span>}
            </div>
          </ReviewCard>
        </div>
      ))}
      {!isLoading && !data.length && <p className="text-sm text-slate-500">Nothing to moderate.</p>}
    </div>
  );
}

export function Users() {
  return <CrudPage title="Users & staff" subtitle="Create admin staff with a role and password; customers/partners/coworkers log in with OTP" endpoint="/admin/users/" queryParams="?page_size=200" canDelete={false}
    columns={[{ key: "full_name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "user_type", label: "Type", render: (r) => titleCase(r.user_type) }, { key: "admin_role", label: "Admin role", render: (r) => titleCase(r.admin_role) }, { key: "is_active", label: "Active", render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> }, { key: "date_joined", label: "Joined", render: (r) => dateOnly(r.date_joined) }]}
    fields={[
      { name: "phone", label: "Phone", required: true }, { name: "first_name", label: "First name" }, { name: "last_name", label: "Last name" }, { name: "email", label: "Email", type: "email" },
      { name: "user_type", label: "User type", type: "select", options: ["customer", "partner", "coworker", "admin"].map((v) => ({ value: v, label: titleCase(v) })), required: true },
      { name: "admin_role", label: "Admin role", type: "select", options: ["super_admin", "verification_officer", "operations", "support", "finance", "marketing"].map((v) => ({ value: v, label: titleCase(v) })) },
      { name: "password", label: "Password (admin staff only, min 8)", type: "password" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ]}
    fromForm={(p) => { const o = { ...p, admin_role: p.admin_role || "", email: p.email || "" }; if (!o.password) delete o.password; return o; }}
    defaults={{ user_type: "admin", is_active: true }} />;
}

export function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: () => api.get("/admin/settings/").then((r) => r.data) });
  const [vals, setVals] = useState({});
  const save = useMutation({
    mutationFn: ({ key, value }) => api.put(`/admin/settings/${key}/`, { value }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (isLoading) return <PageLoader />;
  return (
    <div>
      <PageHeader title="Platform settings" subtitle="Business parameters (BRD section 18). Changes are audit-logged." />
      <div className="card divide-y">
        {data.map((s) => (
          <div key={s.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div><p className="font-medium">{titleCase(s.key)}</p><p className="text-xs text-slate-500">Default: {String(s.default)}</p></div>
            <div className="flex gap-2">
              <input className="input w-36" defaultValue={s.value} onChange={(e) => setVals({ ...vals, [s.key]: e.target.value })} />
              <button className="btn-secondary btn-sm" disabled={vals[s.key] === undefined} onClick={() => save.mutate({ key: s.key, value: isNaN(Number(vals[s.key])) ? vals[s.key] : Number(vals[s.key]) })}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditLogs() {
  const { data, isLoading } = useList("audit", "/admin/audit-logs/?page_size=200");
  return (
    <div>
      <PageHeader title="Audit logs" subtitle="Immutable record of sensitive admin actions" />
      {isLoading ? <PageLoader /> : <DataTable rows={data} columns={[
        { key: "created_at", label: "When", render: (r) => dateTime(r.created_at) }, { key: "actor_name", label: "By" },
        { key: "action", label: "Action" }, { key: "entity", label: "Entity", render: (r) => `${r.entity} #${r.entity_id}` },
        { key: "data", label: "Details", render: (r) => <code className="text-xs">{JSON.stringify(r.data)}</code> },
      ]} />}
    </div>
  );
}

export function TestimonialsAdmin() {
  const fields = [
    { name: "audience", label: "Show on", type: "select", options: [{ value: "customer", label: "Customer pages (Home)" }, { value: "partner", label: "Partner page" }], required: true },
    { name: "name", label: "Name (as they agreed to be shown)", required: true, hint: "e.g. Priya S." },
    { name: "location", label: "City / area" },
    { name: "role", label: "Service booked / business type", hint: "e.g. Deep cleaning, or Plumbing agency" },
    { name: "rating", label: "Rating (1–5)", type: "number", required: true },
    { name: "sort_order", label: "Order", type: "number" },
    { name: "quote", label: "Their words", type: "textarea", required: true, hint: "Use their real words. Max 400 characters." },
    { name: "consent", label: "This person agreed to be shown on the website", type: "checkbox" },
    { name: "is_published", label: "Published", type: "checkbox" },
  ];
  return <CrudPage title="Testimonials" subtitle="Real customer and partner testimonials shown on the website. Publishing needs the person's consent."
    endpoint="/admin/testimonials/"
    columns={[{ key: "name", label: "Name" }, { key: "audience", label: "Shown on" }, { key: "role", label: "Service / business" }, { key: "rating", label: "Rating", render: (r) => "★".repeat(r.rating) },
      { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-2 max-w-xs text-xs">{r.quote}</span> },
      { key: "is_published", label: "Status", render: (r) => <Badge status={r.is_published ? "published" : "draft"} /> }]}
    fields={fields} defaults={{ audience: "customer", rating: 5, sort_order: 0, consent: false, is_published: false }} />;
}
