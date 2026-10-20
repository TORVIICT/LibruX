import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import "./ProtectedRoute.scss";

interface PublicRouteProps {
  children?: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading-container" role="status" aria-live="polite">
        <span className="material-symbols-outlined auth-loading-spinner">autorenew</span>
        <p className="auth-loading-text">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";
    return <Navigate to={fromPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default PublicRoute;
