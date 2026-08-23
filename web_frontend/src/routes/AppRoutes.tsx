import { Routes, Route, Outlet } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import Home from "../pages/Home";
import PrintRates from "../pages/PrintRates";
import FAQ from "../pages/FAQ";
import ContactUs from "../pages/ContactUs";

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/print-rates" element={<PrintRates />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;