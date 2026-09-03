import { Navigate, Routes, Route, Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/utils/ScrollToTop";
import { useRootRouteSmoothScroll } from "../components/utils/headerScroll";

import Home from "../pages/Home";
import PaymentProcess from "../pages/pricing/PaymentProcess";
import UploadProcess from "../pages/learn/UploadProcess";

import PrivacyPolicy from "../pages/legal/PrivacyPolicy";
import TermCondition from "../pages/legal/TermCondition";
import RefundReturn from "../pages/legal/RefundReturn";
import CancelPolicy from "../pages/legal/CancelPolicy";

// Auth pages

// Dashboard pages
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/dashboard/Profile";
import TopUp from "../pages/dashboard/TopUp";

// Route guard
import ProtectedRoute from "./auth/ProtectedRoute";

const MainLayout = () => {
  const location = useLocation();
  useRootRouteSmoothScroll(location.pathname, location.hash);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ScrollToTop />
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<Navigate to="/" state={{ openAuth: "login" }} replace />} />
        <Route path="/signup" element={<Navigate to="/" state={{ openAuth: "signup" }} replace />} />
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<PaymentProcess />} />
        <Route path="/upload" element={<UploadProcess />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermCondition />} />
        <Route path="/refund-return" element={<RefundReturn />} />
        <Route path="/cancel-policy" element={<CancelPolicy />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/topup" element={<TopUp />} />
        </Route>
      </Route>

    </Routes>
  );
};

export default AppRoutes;