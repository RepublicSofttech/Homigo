import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import AddressForm from "../../components/AddressForm";
import { Badge, Empty, Field, PageHeader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: user });
  const [edit, setEdit] = useState(null);
  const addresses = useQuery({ queryKey: ["addresses"], queryFn: () => api.get("/addresses/").then((r) => r.data) });
  const save = useMutation({
    mutationFn: (v) => api.patch("/me/", { first_name: v.first_name, last_name: v.last_name, email: v.email || null, gender: v.gender, language: v.language }).then((r) => r.data),
    onSuccess: (d) => {
      setUser(d);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/addresses/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="My account" subtitle={`+91 ${user.phone}`} />
      <div className="grid gap-6 md:grid-cols-2">
        <form className="card space-y-3" onSubmit={handleSubmit((v) => save.mutate(v))}>
          <h2 className="font-semibold">Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><input className="input" {...register("first_name")} /></Field>
            <Field label="Last name"><input className="input" {...register("last_name")} /></Field>
          </div>
          <Field label="Email"><input className="input" type="email" {...register("email")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender"><select className="input" {...register("gender")}><option value="">-</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></Field>
            <Field label="Language"><select className="input" {...register("language")}><option value="en">English</option><option value="hi">Hindi</option></select></Field>
          </div>
          <p className="text-xs text-slate-500">Referral code: <b>{user.referral_code}</b></p>
          <button className="btn-primary" disabled={save.isPending}>Save</button>
        </form>
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Saved addresses</h2>
            <button className="btn-secondary btn-sm" onClick={() => setEdit({})}>+ Add</button>
          </div>
          {!addresses.data?.length ? <Empty title="No addresses yet" /> : (
            <div className="space-y-3">
              {addresses.data.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold">{a.label} {a.is_default && <Badge status="active">Default</Badge>}</p>
                  <p className="text-slate-600">{a.line1}, {a.line2} {a.city} - {a.pincode}</p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <button className="text-brand-600" onClick={() => setEdit(a)}>Edit</button>
                    <button className="text-red-600" onClick={() => window.confirm("Delete address?") && del.mutate(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {edit && <AddressForm open address={edit.id ? edit : null} onClose={() => setEdit(null)} />}
    </div>
  );
}
