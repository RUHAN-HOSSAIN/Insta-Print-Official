import { Link } from "react-router-dom";

import { navData } from "../../constant/navData";
import { legal } from "../../constant/footerData";
import { handleHeaderNavClick } from "../../utils/headerScroll";
import type { User } from "../../context/AuthContext";
import { ProfileIcon, WalletIcon } from "../../assets/icons/Icons";

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
        className={`md:hidden fixed inset-x-0 bottom-0 z-40
          bg-black/30 backdrop-blur-[2px]
          transition-opacity duration-500
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ top: "var(--header-height, 0px)" }}
      />

      {/* SIDEBAR PANEL */}
      <div
        className={`md:hidden fixed right-0 bottom-0 z-45
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
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <Link
                  to="/dashboard/profile"
                  onClick={onClose}
                  className="rounded-md bg-blue-700 px-4 py-2 text-center text-white shadow-sm flex items-center justify-center gap-1 font-semibold transition hover:bg-blue-800"
                >
                  <ProfileIcon className="h-5 w-5" />
                  Profile
                </Link>

                <Link
                  to="/dashboard/topup"
                  onClick={onClose}
                  className="w-full text-center font-semibold text-green-700 flex items-center justify-center gap-1 rounded-md border border-blue-100 shadow-sm p-2 text-sm transition"
                >
                  <WalletIcon className="inline h-5 w-5 mr-1" />
                  <span>৳ {user.wallet_balance.toFixed(2)}</span>
                </Link>
              </div>

              

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="rounded-md mt-4 bg-red-500 px-4 py-3 text-center text-white shadow-sm font-semibold transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth("login");
              }}
              className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 text-center text-white shadow-sm font-semibold transition-all"
            >
              Sign In
            </button>
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
