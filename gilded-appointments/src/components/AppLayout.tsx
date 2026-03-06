import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PublicNavbar from "./PublicNavbar";
import UserNavbar from "./UserNavbar";
import AdminNavbar from "./AdminNavbar";

const AppLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const renderNavbar = () => {
    if (isAdmin && isAuthenticated && user?.role === "admin") return <AdminNavbar />;
    if (isAuthenticated && user?.role === "user") return <UserNavbar />;
    return <PublicNavbar />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {renderNavbar()}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
