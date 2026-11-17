import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { statusClass } from "../../lib/status";
import { titleCase } from "../../lib/format";

export function Badge({ status, children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {children || titleCase(status)}
    </span>
  );
}

export function Spinner({ className = "" }) {
  return <Loader2 className={`h-5 w-5 animate-spin text-brand-600 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function Empty({ title = "Nothing here yet", text, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  const msg = error?.response?.data?.message || error.message;
  return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</div>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "brand" }) {
  const tones = { brand: "bg-brand-50 text-brand-600", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600" };
  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  // Portal to <body>: a parent with backdrop-blur/transform (e.g. the sticky header) would otherwise
  // trap this fixed overlay inside its own box and clip it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-16" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-xl bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function Field({ label, error, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => {
        const key = t.value ?? t;
        const label = t.label ?? titleCase(t);
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              value === key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function DataTable({ columns, rows, onRowClick, empty = "No records" }) {
  if (!rows?.length) return <Empty title={empty} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="table-th">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id ?? r.key} onClick={() => onRowClick?.(r)} className={onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}>
              {columns.map((c) => (
                <td key={c.key} className="table-td">
                  {c.render ? c.render(r) : r[c.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
