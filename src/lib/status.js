const COLORS = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

const MAP = {
  completed: "green", approved: "green", active: "green", paid: "green", verified: "green", success: "green", resolved: "green",
  confirmed: "blue", assigned: "blue", on_the_way: "blue", arrived: "blue", in_progress: "purple", in_review: "purple",
  under_review: "purple", completion_requested: "purple",
  pending_acceptance: "amber", payment_pending: "amber", pending: "amber", submitted: "amber", open: "amber",
  resubmission_required: "amber", pending_payment: "amber", draft: "gray", inactive: "gray", unpaid: "gray", released: "gray",
  cancelled: "red", rejected: "red", suspended: "red", blacklisted: "red", failed: "red", no_show: "red", expired: "red",
  refunded: "gray", disputed: "red", closed: "gray",
};

export const statusClass = (s) => COLORS[MAP[s] || "gray"];
