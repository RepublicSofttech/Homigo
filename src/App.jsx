import {
  BadgeCheck, BarChart3, Bell, BellRing, Briefcase, CalendarCheck, ClipboardList, CreditCard, Headphones, LayoutDashboard,
  ListChecks, Settings as SettingsIcon, ShieldCheck, Star, Tag, UserCog, Users as UsersIcon, Wallet, Wrench,
} from "lucide-react";
import { Route, Routes } from "react-router-dom";
import BookingDetail from "./components/BookingDetail";
import BookingList from "./components/BookingList";
import PanelLayout from "./components/layout/PanelLayout";
import PublicLayout from "./components/layout/PublicLayout";
import RequireAuth from "./components/layout/RequireAuth";
import { Empty } from "./components/ui";
import AdminDashboard from "./pages/admin/Dashboard";
import Verification from "./pages/admin/Verification";
import { AuditLogs, Catalogue, Coworkers, Finance, OffersAdmin, Partners, Plans, ReviewsModeration, Settings, Users } from "./pages/admin/Admin";
import Jobs from "./pages/coworker/Jobs";
import Account from "./pages/customer/Account";
import Support from "./pages/customer/Support";
import PartnerDashboard from "./pages/partner/Dashboard";
import Earnings from "./pages/partner/Earnings";
import JobRequests from "./pages/partner/JobRequests";
import Onboarding from "./pages/partner/Onboarding";
import RateCard from "./pages/partner/RateCard";
import PartnerReviews from "./pages/partner/Reviews";
import Subscription from "./pages/partner/Subscription";
import Team from "./pages/partner/Team";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Notifications from "./pages/public/Notifications";
import ServiceDetail from "./pages/public/ServiceDetail";
import Services from "./pages/public/Services";
import HowItWorks from "./pages/public/HowItWorks";
import PartnerJoin from "./pages/public/PartnerJoin";
import { About, Offers } from "./pages/public/Static";

const partnerMenu = [
  { to: "/partner", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/partner/requests", label: "Job requests", icon: BellRing },
  { to: "/partner/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/partner/team", label: "Team", icon: UsersIcon },
  { to: "/partner/rate-card", label: "Rate card", icon: ListChecks },
  { to: "/partner/earnings", label: "Earnings", icon: Wallet },
  { to: "/partner/subscription", label: "Subscription", icon: CreditCard },
  { to: "/partner/offers", label: "Offers", icon: Tag },
  { to: "/partner/reviews", label: "Reviews", icon: Star },
  { to: "/partner/onboarding", label: "Business profile", icon: Briefcase },
  { to: "/partner/notifications", label: "Notifications", icon: Bell },
  { to: "/partner/support", label: "Support", icon: Headphones },
];

const coworkerMenu = [
  { to: "/coworker", label: "My jobs", icon: ClipboardList, end: true },
  { to: "/coworker/notifications", label: "Notifications", icon: Bell },
  { to: "/coworker/support", label: "Support", icon: Headphones },
];

const adminMenu = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/verification", label: "Verification", icon: BadgeCheck },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/partners", label: "Partners", icon: Briefcase },
  { to: "/admin/coworkers", label: "Coworkers", icon: UsersIcon },
  { to: "/admin/catalogue", label: "Catalogue", icon: Wrench },
  { to: "/admin/plans", label: "Plans", icon: CreditCard },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/finance", label: "Finance", icon: Wallet },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/tickets", label: "Support tickets", icon: Headphones },
  { to: "/admin/users", label: "Users & staff", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { to: "/admin/audit", label: "Audit logs", icon: ShieldCheck },
];

const NotFound = () => <div className="mx-auto max-w-xl p-10"><Empty title="Page not found" text="The page you are looking for does not exist." /></div>;

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="offers" element={<Offers />} />
        <Route path="about" element={<About />} />
        <Route path="partner/join" element={<PartnerJoin />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="login" element={<Login />} />
        <Route path="bookings" element={<RequireAuth roles={["customer"]}><div className="mx-auto max-w-6xl px-4 py-8"><BookingList title="My bookings" basePath="/bookings" showPartner /></div></RequireAuth>} />
        <Route path="bookings/:id" element={<RequireAuth roles={["customer"]}><div className="mx-auto max-w-6xl px-4 py-8"><BookingDetail /></div></RequireAuth>} />
        <Route path="account" element={<RequireAuth roles={["customer"]}><Account /></RequireAuth>} />
        <Route path="support" element={<RequireAuth><Support /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="partner" element={<RequireAuth roles={["partner"]}><PanelLayout menu={partnerMenu} title="Partner panel" /></RequireAuth>}>
        <Route index element={<PartnerDashboard />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="requests" element={<JobRequests />} />
        <Route path="bookings" element={<BookingList title="Bookings" basePath="/partner/bookings" showCustomer statusFilter />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="rate-card" element={<RateCard />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="offers" element={<OffersAdmin partner />} />
        <Route path="reviews" element={<PartnerReviews />} />
        <Route path="notifications" element={<Notifications embedded />} />
        <Route path="support" element={<Support admin={false} />} />
      </Route>

      <Route path="coworker" element={<RequireAuth roles={["coworker"]}><PanelLayout menu={coworkerMenu} title="Professional app" /></RequireAuth>}>
        <Route index element={<Jobs />} />
        <Route path="jobs/:id" element={<BookingDetail />} />
        <Route path="notifications" element={<Notifications embedded />} />
        <Route path="support" element={<Support />} />
      </Route>

      <Route path="admin" element={<RequireAuth roles={["admin"]}><PanelLayout menu={adminMenu} title="Admin panel" /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="verification" element={<Verification />} />
        <Route path="bookings" element={<BookingList title="All bookings" basePath="/admin/bookings" showCustomer showPartner statusFilter />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="partners" element={<Partners />} />
        <Route path="coworkers" element={<Coworkers />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="plans" element={<Plans />} />
        <Route path="offers" element={<OffersAdmin />} />
        <Route path="finance" element={<Finance />} />
        <Route path="reviews" element={<ReviewsModeration />} />
        <Route path="tickets" element={<Support admin />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="audit" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
}


