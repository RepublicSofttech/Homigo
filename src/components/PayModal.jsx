import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage } from "../api/client";
import { money } from "../lib/format";
import { Modal } from "./ui";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Starts a payment. Mock gateway shows a test-mode confirm; Razorpay opens real checkout. */
export default function PayModal({ open, onClose, purpose, refId, amount, onPaid }) {
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    setBusy(true);
    try {
      const body = { purpose, ...(purpose === "booking" ? { booking_id: refId } : purpose === "subscription" ? { subscription_id: refId } : { amount }) };
      const { data: order } = await api.post("/payments/initiate/", body);
      if (order.gateway === "mock") {
        await api.post("/payments/verify/", { payment_id: order.payment_id });
        toast.success("Payment successful (test mode)");
        onPaid?.();
        onClose();
        return;
      }
      if (!(await loadRazorpay())) throw new Error("Could not load Razorpay checkout");
      const rzp = new window.Razorpay({
        key: order.key_id, amount: Math.round(order.amount * 100), currency: "INR", name: "HomeServ", order_id: order.order_id,
        handler: async (resp) => {
          try {
            await api.post("/payments/verify/", { payment_id: order.payment_id, ...resp });
            toast.success("Payment successful");
            onPaid?.();
            onClose();
          } catch (e) {
            toast.error(errorMessage(e));
          }
        },
      });
      rzp.open();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Complete payment">
      <p className="text-sm text-slate-500">Amount payable</p>
      <p className="mb-4 text-3xl font-bold">{money(amount)}</p>
      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        If the server runs with <code>PAYMENT_GATEWAY=mock</code>, no money is charged — the payment is marked successful for testing.
      </p>
      <button className="btn-primary w-full" onClick={pay} disabled={busy}>{busy ? "Processing..." : `Pay ${money(amount)}`}</button>
    </Modal>
  );
}
