import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, errorMessage } from "../api/client";
import { useLocation2 } from "../context/LocationContext";
import { Field, Modal } from "./ui";

export default function AddressForm({ open, onClose, address, onSaved }) {
  const qc = useQueryClient();
  const { location, detect } = useLocation2();
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: address || { label: "Home", latitude: location.lat, longitude: location.lng, city: location.name === "Current location" ? "" : location.name },
  });
  const save = useMutation({
    mutationFn: (v) => (address?.id ? api.patch(`/addresses/${address.id}/`, v) : api.post("/addresses/", v)).then((r) => r.data),
    onSuccess: (data) => {
      toast.success("Address saved");
      qc.invalidateQueries({ queryKey: ["addresses"] });
      onSaved?.(data);
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const useGps = () =>
    detect()
      .then((l) => {
        setValue("latitude", l.lat);
        setValue("longitude", l.lng);
        toast.success("Location captured");
      })
      .catch((e) => toast.error(e.message));
  return (
    <Modal open={open} onClose={onClose} title={address?.id ? "Edit address" : "Add address"}>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-3 sm:grid-cols-2">
        <Field label="Label"><select className="input" {...register("label")}><option>Home</option><option>Office</option><option>Other</option></select></Field>
        <Field label="Pincode *"><input className="input" {...register("pincode", { required: true })} /></Field>
        <div className="sm:col-span-2"><Field label="House / flat, street *"><input className="input" {...register("line1", { required: true })} /></Field></div>
        <Field label="Area / locality"><input className="input" {...register("line2")} /></Field>
        <Field label="Landmark"><input className="input" {...register("landmark")} /></Field>
        <Field label="City *"><input className="input" {...register("city", { required: true })} /></Field>
        <Field label="State"><input className="input" {...register("state")} /></Field>
        <Field label="Latitude"><input className="input" {...register("latitude", { required: true })} /></Field>
        <Field label="Longitude"><input className="input" {...register("longitude", { required: true })} /></Field>
        <button type="button" onClick={useGps} className="btn-secondary sm:col-span-2">Use my current GPS location</button>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" {...register("is_default")} /> Make default</label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={save.isPending}>Save address</button>
        </div>
      </form>
    </Modal>
  );
}
