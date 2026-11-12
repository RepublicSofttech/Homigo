import { Navigate, useLocation } from "react-router-dom";
import { homePathFor, useAuth } from "../../context/AuthContext";
import { PageLoader } from "../ui";

export default function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (roles && !roles.includes(user.user_type)) return <Navigate to={homePathFor(user)} replace />;
  return children;
}
