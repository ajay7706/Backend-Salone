import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import BookAppointment from "@/pages/BookAppointment";
import MyBookings from "@/pages/MyBookings";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPassword from "@/pages/ForgotPassword";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminServices from "@/pages/admin/AdminServices";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminUsers from "@/pages/admin/AdminUsers";
import NotFound from "@/pages/NotFound";
import DebugPage from "@/pages/DebugPage";

const queryClient = new QueryClient();

const AppTitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || "/";

    const segments = path === "/" ? ["home"] : path.split("/").filter(Boolean);
    const pageSegment = segments[segments.length - 1] || "home";

    const formattedPageName = pageSegment
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const title =
      formattedPageName.toLowerCase() === "home"
        ? "Home | Luxe Salon"
        : `${formattedPageName} | Luxe Salon`;

    document.title = title;
  }, [location.pathname]);

  return null;
};

const LoginRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />;
  return <LoginPage />;
};

const SignupRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/"} replace />;
  return <SignupPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppTitleManager />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/signup" element={<SignupRedirect />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected user routes */}
              <Route
                path="/book-appointment"
                element={
                  <ProtectedRoute allowedRoles={["user"]} redirectTo="/signup">
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={["user"]} redirectTo="/signup">
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["user"]} redirectTo="/signup">
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              <Route path="/debug" element={<DebugPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
