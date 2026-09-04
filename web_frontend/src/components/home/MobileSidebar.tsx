import { Link } from "react-router-dom";

import { navData } from "../../constant/navData";
import { legal } from "../../constant/footerData";
import { handleHeaderNavClick } from "../../utils/headerScroll";
import type { User } from "../../context/AuthContext";

type MobileSidebarProps = {
  isOpen: boolean;
  activeNavTo: string;
  pathname: string;
  onClose: () => void;
  onOpenAuth: (step: "login" | "signup") => void;
  user: User | null;
  onLogout: () => void;
};

const MobileSidebar = ({
  isOpen,
  activeNavTo,
  pathname,
  onClose,
  onOpenAuth,
  user,
  onLogout,
}: MobileSidebarProps) => {
  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`sm:hidden fixed inset-x-0 bottom-0 z-40
          bg-black/30 backdrop-blur-[2px]
          transition-opacity duration-500
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ top: "var(--header-height, 0px)" }}
      />

      {/* SIDEBAR PANEL */}
      <div
        className={`sm:hidden fixed right-0 bottom-0 z-45
          bg-white font-spaceG shadow-2xl
          overflow-y-auto overflow-x-hidden
          w-[min(80vw,340px)]
          transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.18,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          top: "var(--header-height, 0px)",
          maxHeight: "calc(100dvh - var(--header-height, 0px))",
        }}
      >
        <nav className="px-6 pt-4 pb-8 flex flex-col">
          <ul className="flex flex-col">
            {navData.map((item, index) => (
              <li
                key={index}
                className="border-b border-gray-100 last:border-b-0"
              >
                <Link
                  to={item.to}
                  onClick={(event) =>
                    handleHeaderNavClick({
                      event,
                      to: item.to,
                      pathname,
                      closeMenu: onClose,
                    })
                  }
                  className={`flex items-center py-4 text-[17px] font-semibold transition-colors duration-200 ${
                    activeNavTo === item.to
                      ? "text-blue-700"
                      : "text-gray-900 hover:text-blue-700"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/dashboard" onClick={onClose} className="text-center font-semibold text-green-700">Wallet: ৳ {user.wallet_balance.toFixed(2)}</Link>
              <Link to="/dashboard/profile" onClick={onClose} className="rounded-md bg-blue-700 px-4 py-3 text-center text-white">Profile</Link>
              <button type="button" onClick={() => { onLogout(); onClose(); }} className="text-slate-600">Log out</button>
            </div>
          ) : (
            <button type="button" onClick={() => { onClose(); onOpenAuth("login"); }} className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 text-center text-white transition-all hover:bg-blue-800">Sign In</button>
          )}

          <div className="flex text-xs flex-wrap gap-4 mt-6 text-gray-600">
            {legal.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                onClick={(event) =>
                  handleHeaderNavClick({
                    event,
                    to: item.to,
                    pathname,
                    closeMenu: onClose,
                  })
                }
                className=""
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;
