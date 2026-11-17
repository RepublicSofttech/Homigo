import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLocation2 } from "../context/LocationContext";

/**
 * Loads the Homigo Assist chat widget (separate service) and keeps it in sync with
 * login state, the chosen city and SPA navigation.
 * URL: VITE_ASSIST_URL, else "<API origin>/assist" (same host as the API). Set VITE_ASSIST_URL=off to disable.
 */
function assistUrl() {
  const v = import.meta.env.VITE_ASSIST_URL;
  if (v === "off") return "";
  if (v) return v.replace(/\/$/, "");
  try {
    return `${new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").origin}/assist`;
  } catch {
    return "";
  }
}
export const ASSIST_URL = assistUrl();

export default function AssistWidget() {
  const navigate = useNavigate();
  const route = useLocation();
  const { user } = useAuth();
  const { location } = useLocation2();
  const ref = useRef({ navigate, location, route });
  ref.current = { navigate, location, route };
  const lastUser = useRef(undefined);

  useEffect(() => {
    if (!ASSIST_URL) return;
    const init = () =>
      window.HomigoAssist?.init({
        apiBase: ASSIST_URL,
        getToken,
        getContext: () => {
          const { location: loc, route: r } = ref.current;
          return { page: r.pathname, city: loc?.name, lat: loc?.lat, lng: loc?.lng };
        },
        navigate: (path) => ref.current.navigate(path),
      });
    if (window.HomigoAssist) return void init();
    const s = document.createElement("script");
    s.src = `${ASSIST_URL}/widget.js`;
    s.async = true;
    s.onload = init;
    document.body.appendChild(s);
  }, []);

  // New identity -> new chat session (guest -> customer after login, logout, account switch)
  useEffect(() => {
    const id = user?.id ?? null;
    if (lastUser.current !== undefined && lastUser.current !== id) window.HomigoAssist?.reset?.();
    lastUser.current = id;
  }, [user?.id]);

  return null;
}
