import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { navData } from "../constant/navData";
import {
  handleHeaderNavClick,
  useHeaderHeightCssVar,
} from "../utils/headerScroll";
import MobileSidebar from "./home/MobileSidebar";

import LogoMain from "../assets/logo_main.webp";
import InstaPrintLogo from "../assets/InstaPrint.png";
import {
  HamburgerIcon,
  CloseIcon,
  WalletIcon,
  ProfileIcon,
} from "../assets/icons/Icons";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "../context/useAuth";
import { ChevronDown, CirclePlus, LogOutIcon, UserIcon } from "lucide-react";

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

// Logged in user এর wallet balance + profile icon এর dropdown
// Sign In button এর জায়গায় এটা দেখাবে
const UserMenu = ({ onLogout }: { onLogout: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown এর বাইরে click করলে বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Wallet Balance — click করলে TopUp page */}
      <Link
        to="/dashboard/topup"
        className="shrink-0 flex items-center gap-2 rounded-full border border-blue-100 px-2 py-1.5 lg:px-4 lg:py-2 font-spaceG font-bold shadow-sm hover:scale-102 hover:shadow-md transition-all duration-150"
      >
        <WalletIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
        {/* <WalletCards className="h-5 w-5" /> */}
        <span className="text-green-600 text-sm lg:text-base">
          ৳ {user.wallet_balance.toFixed(2)}
        </span>
      </Link>

      {/* Profile Icon — click করলে dropdown toggle */}
      {/* তোমার নিজের icon/avatar বসাও */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 lg:p-1.5 pr-3 shadow-sm transition hover:border-[#bfe4c8]"
        aria-label="Profile menu"
      >
        <ProfileIcon className="lg:h-7 lg:w-7 h-6 w-6 text-blue-600" />
        <ChevronDown
          className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-50"
          >
            <UserIcon className="inline h-4 w-4 mr-2" />
            Profile
          </Link>
          <Link
            to="/dashboard/topup"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-50"
          >
            <CirclePlus className="inline h-4 w-4 mr-2" />
            Top Up
          </Link>
          <button
            type="button"
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm md:text-base text-red-600 hover:bg-gray-50"
          >
            <LogOutIcon className="inline h-4 w-4 mr-2" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

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
  const requestedAuth = (
    location.state as { openAuth?: "login" | "signup" } | null
  )?.openAuth;
  const activeAuthModal = authModal ?? requestedAuth;

  useEffect(() => {
    if (location.pathname !== "/") return;

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <div
        ref={headerRef}
        className="fixed z-50 shadow bg-white w-full flex items-center justify-between px-5 sm:px-7 md:px-10 lg:px-15 xl:px-20 py-3 border-b-2 border-gray-200"
      >
        {/* Logo */}
        <div className="flex-1 md:flex-2">
          <Link
            to="/"
            onClick={(e) =>
              handleHeaderNavClick({
                event: e,
                to: "/",
                pathname: location.pathname,
                closeMenu,
              })
            }
            className="flex items-center gap-1 sm:gap-2 cursor-pointer"
          >
            <img
              src={LogoMain}
              alt="Logo"
              className="h-8 sm:h-9 min-[900px]:h-10 lg:h-12"
            />
            <img
              src={InstaPrintLogo}
              alt="Logo"
              className="h-8 sm:h-9 min-[900px]:h-10 lg:h-12"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="max-md:hidden flex-1 flex items-center justify-between gap-5 md:gap-7 font-spaceG lg:text-[17px] text-black cursor-pointer">
          {navData.map((item, index) => (
            <Link
              to={item.to}
              key={index}
              onClick={(e) =>
                handleHeaderNavClick({
                  event: e,
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

          {/* Logged in: UserMenu | Guest: Sign In button */}
          {user ? (
            <UserMenu onLogout={logout} />
          ) : (
            <button
              type="button"
              onClick={() => setAuthModal("login")}
              className="shrink-0 rounded-md bg-blue-700 px-4 py-2 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-800"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex-1 flex items-center justify-end cursor-pointer">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/topup"
                className="shrink-0 flex items-center gap-1 shadow-[0px_0px_5px_rgba(0,0,0,0.2)] rounded-full px-2 py-1"
              >
                <WalletIcon className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium sm:text-base text-green-700">{user.wallet_balance.toFixed(2)}</span>
              </Link>
              <Link
                to="/dashboard/profile"
                className="ml-3 mr-4 shadow-[0px_0px_5px_rgba(0,0,0,0.2)] rounded-full p-1"
              >
                <ProfileIcon className="w-6 h-6 text-blue-600" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModal("login");
              }}
              className=" text-xs min-[500px]:text-sm sm:text-base rounded-2xl bg-blue-700 mr-4 sm:mr-6 px-3 sm:px-4 py-1 text-center text-white shadow-md font-semibold transition-all"
            >
              Sign In
            </button>
          )}

          {isMenuOpen ? (
            <CloseIcon
              className="text-slate-800 w-6"
              onClick={() => setIsMenuOpen(false)}
            />
          ) : (
            <HamburgerIcon
              className="text-slate-800"
              onClick={() => setIsMenuOpen(true)}
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

      {activeAuthModal && (
        <AuthModal
          initialStep={activeAuthModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
};

export default Header;
