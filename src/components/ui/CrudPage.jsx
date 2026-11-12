import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, errorMessage, listOf, toFormData } from "../../api/client";
import { DataTable, ErrorBox, Field, Modal, PageHeader, PageLoader } from "./index";

/**
 * Config driven list + create/edit/delete page.
 * fields: [{name,label,type:'text'|'number'|'textarea'|'select'|'checkbox'|'date'|'datetime'|'json'|'file'|'multiselect', options:[{value,label}], required, hint}]
 */
export default function CrudPage({ title, subtitle, endpoint, columns, fields, defaults = {}, canDelete = true, canCreate = true, multipart = false, queryParams = "", toForm, fromForm }) {
  const qc = useQueryClient();
  const key = [endpoint, queryParams];
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => api.get(`${endpoint}${queryParams}`).then((r) => r.data) });
  const [editing, setEditing] = useState(null);

  const del = useMutation({
    mutationFn: (id) => api.delete(`${endpoint}${id}/`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const actionCol = {
    key: "_actions",
    label: "",
    render: (r) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="btn-secondary btn-sm" onClick={() => setEditing(r)} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {canDelete && (
          <button className="btn-secondary btn-sm text-red-600" aria-label="Delete" onClick={() => window.confirm("Delete this record?") && del.mutate(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    ),
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={canCreate && (
          <button className="btn-primary" onClick={() => setEditing({})}>
            <Plus className="h-4 w-4" /> Add
          </button>
        )}
      />
      <ErrorBox error={error} />
      {isLoading ? <PageLoader /> : <DataTable columns={[...columns, actionCol]} rows={listOf(data)} />}
      {editing && (
        <CrudForm
          record={editing}
          fields={fields}
          defaults={defaults}
          endpoint={endpoint}
          multipart={multipart}
          toForm={toForm}
          fromForm={fromForm}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: [endpoint] });
          }}
        />
      )}
    </div>
  );
}

function toLocalInput(v) {
  if (!v) return "";
  const d = new Date(v);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function CrudForm({ record, fields, defaults, endpoint, multipart, onClose, onSaved, toForm, fromForm }) {
  const isEdit = !!record.id;
  const initial = { ...defaults, ...record };
  fields.forEach((f) => {
    if (f.type === "json") initial[f.name] = JSON.stringify(initial[f.name] ?? (f.default || []), null, 0);
    if (f.type === "datetime") initial[f.name] = toLocalInput(initial[f.name]);
    if (f.type === "file") delete initial[f.name];
    if (f.type === "multiselect") initial[f.name] = (initial[f.name] || []).map(String);
  });
  const { register, handleSubmit, formState } = useForm({ defaultValues: toForm ? toForm(initial) : initial });
  const save = useMutation({
    mutationFn: (values) => {
      let payload = {};
      fields.forEach((f) => {
        let v = values[f.name];
        if (f.type === "json") v = v ? JSON.parse(v) : [];
        if (f.type === "number") v = v === "" || v === null ? null : Number(v);
        if (f.type === "datetime") v = v ? new Date(v).toISOString() : null;
        if (f.type === "select" && v === "") v = null;
        if (f.type === "multiselect") v = (v || []).map(Number);
        payload[f.name] = v;
      });
      if (fromForm) payload = fromForm(payload);
      if (multipart) payload = toFormData(payload);
      return isEdit ? api.patch(`${endpoint}${record.id}/`, payload) : api.post(endpoint, payload);
    },
    onSuccess: () => {
      toast.success("Saved");
      onSaved();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit" : "Add new"} wide>
      <form
        onSubmit={handleSubmit((v) => {
          try {
            save.mutate(v);
          } catch (e) {
            toast.error("Invalid JSON: " + e.message);
          }
        })}
        className="grid gap-4 sm:grid-cols-2"
      >
        {fields.map((f) => (
          <div key={f.name} className={f.type === "textarea" || f.type === "json" || f.full ? "sm:col-span-2" : ""}>
            {f.type === "checkbox" ? (
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(f.name)} className="h-4 w-4" /> {f.label}
              </label>
            ) : (
              <Field label={f.label + (f.required ? " *" : "")} hint={f.hint} error={formState.errors[f.name] && "Required"}>
                {f.type === "textarea" || f.type === "json" ? (
                  <textarea rows={3} className="input font-mono text-xs" {...register(f.name, { required: f.required })} />
                ) : f.type === "select" || f.type === "multiselect" ? (
                  <select className="input" multiple={f.type === "multiselect"} {...register(f.name, { required: f.required })}>
                    {f.type === "select" && <option value="">-- Select --</option>}
                    {(f.options || []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    type={f.type === "datetime" ? "datetime-local" : f.type || "text"}
                    step={f.type === "number" ? "any" : undefined}
                    {...register(f.name, { required: f.required && !(f.type === "file" && isEdit) })}
                  />
                )}
              </Field>
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={save.isPending}>
            {save.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
