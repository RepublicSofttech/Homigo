import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, listOf } from "../api/client";
import { dateTime, money } from "../lib/format";
import { Badge, DataTable, PageHeader, PageLoader, Tabs } from "./ui";

export default function BookingList({ title = "Bookings", basePath, showCustomer, showPartner, statusFilter }) {
  const nav = useNavigate();
  const [bucket, setBucket] = useState("upcoming");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", bucket, status],
    queryFn: () => api.get(`/bookings/?page_size=100${bucket !== "all" ? `&bucket=${bucket}` : ""}${status ? `&status=${status}` : ""}`).then((r) => listOf(r.data)),
    refetchInterval: 20000,
  });
  const columns = [
    { key: "booking_no", label: "Booking", render: (b) => <span className="font-mono text-xs font-semibold">{b.booking_no}</span> },
    { key: "service_name", label: "Service" },
    ...(showCustomer ? [{ key: "customer_name", label: "Customer" }] : []),
    ...(showPartner ? [{ key: "partner_name", label: "Provider" }] : []),
    { key: "scheduled_start", label: "When", render: (b) => dateTime(b.scheduled_start) },
    { key: "total", label: "Amount", render: (b) => money(b.total) },
    { key: "status", label: "Status", render: (b) => <Badge status={b.status} /> },
  ];
  return (
    <div>
      <PageHeader title={title} actions={statusFilter && (
        <select className="input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["pending_acceptance", "confirmed", "assigned", "in_progress", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      )} />
      <Tabs tabs={["upcoming", "today", "past", "all"]} value={bucket} onChange={setBucket} />
      {isLoading ? <PageLoader /> : <DataTable columns={columns} rows={listOf(data)} onRowClick={(b) => nav(`${basePath}/${b.id}`)} empty="No bookings here" />}
    </div>
  );
}
