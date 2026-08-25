import { Routes, Route, Outlet, useLocation } from "react-router-dom";


import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/utils/ScrollToTop";
import { useRootRouteSmoothScroll } from "../components/utils/headerScroll";

import Home from "../pages/Home";
import PrivacyPolicy from "../pages/legal/PrivacyPolicy";
import TermCondition from "../pages/legal/TermCondition";
import RefundReturn from "../pages/legal/RefundReturn";
import CancelPolicy from "../pages/legal/CancelPolicy";

const Layout = () => {
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
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermCondition />} />
        <Route path="/refund-return" element={<RefundReturn />} />
        <Route path="/cancel-policy" element={<CancelPolicy />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;