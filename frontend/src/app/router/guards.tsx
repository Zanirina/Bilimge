import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import type { UserRole } from "../../modules/auth/model/types";
import Loader from "../../shared/ui/Loader";

type Props = {
  roles?: UserRole[];
};

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export const RequireAuth: React.FC<Props> = ({ roles }) => {
  const isAuth = useAuthStore((s) => s.isAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const required = useMemo(
    () => (roles && roles.length > 0 ? roles.map(norm) : null),
    [roles],
  );

  if (isLoading) return <Loader message="Checking access..." />;

  if (!isAuth) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  if (!user) return <Loader message="Loading profile..." />;

  if (required) {
    const ok = required.some((role) => norm(user.role) === role);
    if (!ok) return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};