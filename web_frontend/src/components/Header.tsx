
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { navData } from "../constant/navData";
import { handleHeaderNavClick, useHeaderHeightCssVar } from "../utils/headerScroll";
import MobileSidebar from "./home/MobileSidebar.tsx";

import Logo from "../assets/navLogo.webp";
import { HamburgerIcon, CloseIcon } from "../assets/icons/Icons.tsx";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [activeNavTo, setActiveNavTo] = useState("/");
  const location = useLocation();
  const headerRef = useHeaderHeightCssVar();
  const { user, logout } = useAuth();

  const navSections = useMemo(
    () => [
      { to: "/", id: "home" },
      ...navData
        .filter((item) => item.to.startsWith("/#"))
        .map((item) => ({ to: item.to, id: item.to.slice(2) })),
    ],
    [],
  );
  const displayActiveNavTo = location.pathname === "/" ? activeNavTo : "";

  const requestedAuth = (location.state as { openAuth?: "login" | "signup" } | null)?.openAuth;
  const activeAuthModal = authModal ?? requestedAuth;

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const updateActiveNav = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const scrollPosition = window.scrollY + headerHeight + 16;

      let currentNavTo = "/";

      navSections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentNavTo = section.to;
        }
      });

      setActiveNavTo(currentNavTo);
    };

    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);

    return () => {
      window.removeEventListener("scroll", updateActiveNav);
      window.removeEventListener("resize", updateActiveNav);
    };
  }, [location.pathname, location.hash, navSections, headerRef]);

  // Close menu whenever screen grows past the mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Lock/unlock body scroll while the mobile sidebar is open (plain CSS, no library)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div
        ref={headerRef}
        className="fixed z-50 shadow bg-white w-full flex items-center justify-between px-5 sm:px-7 md:px-10 lg:px-15 xl:px-20 py-3 border-b-2 border-gray-200"
      >
        <div className="flex-1 md:flex-2">
          <Link
            to="/"
            onClick={(event) =>
              handleHeaderNavClick({
                event,
                to: "/",
                pathname: location.pathname,
                closeMenu,
              })
            }
          >
            <img src={Logo} alt="Logo" className="h-8 sm:h-9 md:h-10 lg:h-12" />
          </Link>
        </div>

        <div className="max-md:hidden flex-1 flex items-center justify-between gap-5 md:gap-7 font-spaceG lg:text-[17px] text-black cursor-pointer">
          {navData.map((item: { title: string; to: string }, index: number) => (
            <Link
              to={item.to}
              key={index}
              onClick={(event) =>
                handleHeaderNavClick({
                  event,
                  to: item.to,
                  pathname: location.pathname,
                  closeMenu,
                })
              }
              className={`hover:underline underline-offset-4 hover:scale-105 transition-all ${
                displayActiveNavTo === item.to ? "text-blue-700" : "text-black"
              }`}
            >
              {item.title}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/dashboard" className="font-semibold text-green-700 hover:underline">৳ {user.wallet_balance.toFixed(2)}</Link>
              <Link to="/dashboard/profile" className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">Profile</Link>
              <button type="button" onClick={logout} className="text-slate-600 hover:text-red-600">Log out</button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setAuthModal("login")} 
              className="z-50 shrink-0 max-md:hidden rounded-md bg-blue-700 px-4 py-2 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-800">
              Sign In
            </button>
          )}
        </div>

        <div className="md:hidden flex-1 flex items-center justify-end cursor-pointer">
          {isMenuOpen ? (
            <CloseIcon
              className="text-slate-800 w-6"
              onClick={toggleMenu}
            />
          ) : (
            <HamburgerIcon
              className="text-slate-800"
              onClick={toggleMenu}
            />
          )}
        </div>
      </div>

      <MobileSidebar
        isOpen={isMenuOpen}
        activeNavTo={displayActiveNavTo}
        pathname={location.pathname}
        onClose={closeMenu}
        onOpenAuth={(step) => setAuthModal(step)}
        user={user}
        onLogout={logout}
      />
      {activeAuthModal && <AuthModal initialStep={activeAuthModal} onClose={() => setAuthModal(null)} />}
    </>
  );
};

export default Header;