import { Routes, Route, Outlet } from "react-router-dom";


import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/utils/ScrollToTop";

import Home from "../pages/Home";

const Layout = () => {

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
      </Route>
    </Routes>
  );
};

export default AppRoutes;