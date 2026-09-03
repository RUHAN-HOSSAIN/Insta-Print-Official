
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Auth check চলছে — কিছু দেখাবো না এখনো
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Login নেই → /login এ পাঠাও
  if (!user) return <Navigate to="/" state={{ openAuth: "login" }} replace />;

  // Login আছে → page দেখাও
  return <Outlet />;
};

export default ProtectedRoute;