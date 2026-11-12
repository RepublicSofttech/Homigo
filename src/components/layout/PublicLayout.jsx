import { useQuery } from "@tanstack/react-query";
import { Bell, Home, LogOut, MapPin, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { homePathFor, useAuth } from "../../context/AuthContext";
import { CITIES, useLocation2 } from "../../context/LocationContext";
import { Modal } from "../ui";

export function Logo({ dark }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
        <Home className="h-5 w-5 text-white" />
      </span>
      <span className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>
        Home<span className="text-brand-600">Serv</span>
      </span>
    </Link>
  );
}

export function LocationPicker() {
  const { location, setLocation, detect } = useLocation2();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
        <MapPin className="h-4 w-4 text-brand-600" />
        <span className="max-w-[140px] truncate">{location.name}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Select your location">
        <button
          className="btn-primary mb-4 w-full"
          onClick={() =>
            detect()
              .then(() => setOpen(false))
              .catch((e) => toast.error(e.message))
          }
        >
          <MapPin className="h-4 w-4" /> Use my current location
        </button>
        <div className="grid grid-cols-2 gap-2">
          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setLocation(c);
                setOpen(false);
              }}
              className={`rounded-lg border px-3 py-2 text-sm ${location.name === c.name ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

function UnreadBell() {
  const { data } = useQuery({ queryKey: ["unread"], queryFn: () => api.get("/notifications/unread-count/").then((r) => r.data), refetchInterval: 30000 });
  return (
    <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {data?.count > 0 && <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{data.count}</span>}
    </Link>
  );
}

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const links = [
    { to: "/services", label: "Services" },
    { to: "/offers", label: "Offers" },
    ...(user?.user_type === "customer" ? [{ to: "/bookings", label: "My Bookings" }] : []),
  ];
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Logo />
          <div className="hidden sm:block">
            <LocationPicker />
          </div>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`}>
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <Link to="/partner/join" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                Become a Partner
              </Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user ? (
              <>
                <UnreadBell />
                {user.user_type !== "customer" ? (
                  <Link to={homePathFor(user)} className="btn-primary btn-sm">Open panel</Link>
                ) : (
                  <Link to="/account" className="rounded-lg p-2 hover:bg-slate-100" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    nav("/");
                  }}
                  className="hidden rounded-lg p-2 hover:bg-slate-100 sm:block"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary btn-sm">Login</Link>
            )}
            <button className="rounded-lg p-2 md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t px-4 py-3 md:hidden" onClick={() => setMenu(false)}>
            <div className="mb-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
              <LocationPicker />
            </div>
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2 text-sm font-medium">{l.label}</Link>
            ))}
            {!user && <Link to="/partner/join" className="block py-2 text-sm font-medium">Become a Partner</Link>}
            {user && <button onClick={logout} className="block py-2 text-sm font-medium text-red-600">Logout</button>}
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-16 bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <Logo dark />
            <p className="mt-3 text-sm text-slate-400">Verified professionals at your doorstep. Plumbers, electricians, cleaning, maids, security and more.</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Company</p>
            <Link to="/about" className="block py-1 hover:text-white">About us</Link>
            <Link to="/partner/join" className="block py-1 hover:text-white">Become a partner</Link>
            <Link to="/support" className="block py-1 hover:text-white">Help & support</Link>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Policies</p>
            <p className="py-1">Terms & Conditions</p>
            <p className="py-1">Privacy Policy</p>
            <p className="py-1">Cancellation & Refund</p>
          </div>
        </div>
        <p className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} HomeServ. All rights reserved.</p>
      </footer>
    </div>
  );
}
