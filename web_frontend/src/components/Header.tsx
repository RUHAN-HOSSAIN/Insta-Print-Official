
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";


import { navData } from "../constant/navData";
import {
  handleHeaderNavClick,
  useHeaderHeightCssVar,
} from "./utils/headerScroll";

import Logo from "../assets/Logo2.jpg";
import { HamburgerIcon, CloseIcon } from "../assets/icons/Icons.tsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const headerRef = useHeaderHeightCssVar();

  return (
    <>
      <div
        ref={headerRef}
        className="fixed shadow bg-white w-full flex items-center justify-between px-5 sm:px-7 md:px-10 lg:px-15 xl:px-20 py-2 border-b-2 border-gray-200"
      >
        <div className="flex-1 md:flex-2">
          <Link
            to="/"
            onClick={(event) =>
              handleHeaderNavClick({
                event,
                to: "/",
                pathname: location.pathname,
                closeMenu: () => setIsMenuOpen(false),
              })
            }
          >
            <img src={Logo} alt="Logo" className="h-8 sm:h-9 md:h-10 lg:h-12" />
          </Link>
        </div>
        
        <div className="max-sm:hidden flex-1 flex items-center justify-between gap-5 md:gap-7 font-spaceG lg:text-[17px] text-black cursor-pointer">
          {navData.map((item: { title: string; to: string }, index: number) => (
            <Link
              to={item.to}
              key={index}
              onClick={(event) =>
                handleHeaderNavClick({
                  event,
                  to: item.to,
                  pathname: location.pathname,
                  closeMenu: () => setIsMenuOpen(false),
                })
              }
              className=" hover:underline underline-offset-4 hover:scale-105 transition-all"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="sm:hidden flex-1 flex items-center justify-end cursor-pointer">
          {isMenuOpen ? (
            <CloseIcon
              className="text-slate-800"
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
    </>
  );
};

export default Header;
