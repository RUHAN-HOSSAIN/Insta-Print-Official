
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { navData } from "../constant/navData";
import {
  handleHeaderNavClick,
  useHeaderHeightCssVar,
} from "./utils/headerScroll";
import MobileSidebar from "./home/MobileSidebar.tsx";

import Logo from "../assets/Logo3.webp";
import { HamburgerIcon, CloseIcon } from "../assets/icons/Icons.tsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavTo, setActiveNavTo] = useState("/");
  const location = useLocation();
  const headerRef = useHeaderHeightCssVar();

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
            className="max-lg:hidden bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 shadow-md rounded-md hover:scale-105 transition-all cursor-pointer shrink-0"
          >
            Try Now
          </Link>
        </div>

        <div className="sm:hidden flex-1 flex items-center justify-end cursor-pointer">
          {isMenuOpen ? (
            <CloseIcon
              className="text-slate-800"
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
      />
    </>
  );
};

export default Header;





// import { useEffect, useMemo, useState } from "react";
// import { Link, useLocation } from "react-router-dom";

// import { navData } from "../constant/navData";
// import {
//   handleHeaderNavClick,
//   useHeaderHeightCssVar,
// } from "./utils/headerScroll";

// import Logo from "../assets/Logo.jpg";
// import { HamburgerIcon, CloseIcon } from "../assets/icons/Icons.tsx";

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [activeNavTo, setActiveNavTo] = useState("/");
//   const location = useLocation();
//   const headerRef = useHeaderHeightCssVar();

//   const navSections = useMemo(
//     () => [
//       { to: "/", id: "home" },
//       ...navData
//         .filter((item) => item.to.startsWith("/#"))
//         .map((item) => ({ to: item.to, id: item.to.slice(2) })),
//     ],
//     [],
//   );
//   const displayActiveNavTo = location.pathname === "/" ? activeNavTo : "";

//   useEffect(() => {
//     if (location.pathname !== "/") {
//       return;
//     }

//     const updateActiveNav = () => {
//       const headerHeight = headerRef.current?.offsetHeight ?? 0;
//       const scrollPosition = window.scrollY + headerHeight + 16;

//       let currentNavTo = "/";

//       navSections.forEach((section) => {
//         const element = document.getElementById(section.id);
//         if (element && element.offsetTop <= scrollPosition) {
//           currentNavTo = section.to;
//         }
//       });

//       setActiveNavTo(currentNavTo);
//     };

//     updateActiveNav();
//     window.addEventListener("scroll", updateActiveNav, { passive: true });
//     window.addEventListener("resize", updateActiveNav);

//     return () => {
//       window.removeEventListener("scroll", updateActiveNav);
//       window.removeEventListener("resize", updateActiveNav);
//     };
//   }, [location.pathname, location.hash, navSections, headerRef]);

//   return (
//     <>
//       <div
//         ref={headerRef}
//         className="fixed z-50 shadow bg-white w-full flex items-center justify-between px-5 sm:px-7 md:px-10 lg:px-15 xl:px-20 py-3 border-b-2 border-gray-200"
//       >
//         <div className="flex-1 md:flex-2">
//           <Link
//             to="/"
//             onClick={(event) =>
//               handleHeaderNavClick({
//                 event,
//                 to: "/",
//                 pathname: location.pathname,
//                 closeMenu: () => setIsMenuOpen(false),
//               })
//             }
//           >
//             <img src={Logo} alt="Logo" className="h-8 sm:h-9 md:h-10 lg:h-12" />
//           </Link>
//         </div>

//         <div className="max-sm:hidden flex-1 flex items-center justify-between gap-5 md:gap-7 font-spaceG lg:text-[17px] text-black cursor-pointer">
//           {navData.map((item: { title: string; to: string }, index: number) => (
//             <Link
//               to={item.to}
//               key={index}
//               onClick={(event) =>
//                 handleHeaderNavClick({
//                   event,
//                   to: item.to,
//                   pathname: location.pathname,
//                   closeMenu: () => setIsMenuOpen(false),
//                 })
//               }
//               className={`hover:underline underline-offset-4 hover:scale-105 transition-all ${
//                 displayActiveNavTo === item.to ? "text-blue-700" : "text-black"
//               }`}
//             >
//               {item.title}
//             </Link>
//           ))}

//           <Link
//             to="/"
//             onClick={(event) =>
//               handleHeaderNavClick({
//                 event,
//                 to: "/",
//                 pathname: location.pathname,
//                 closeMenu: () => setIsMenuOpen(false),
//               })
//             }
//             className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 shadow-md rounded-md hover:scale-105 transition-all cursor-pointer shrink-0"
//           >
//             Try Now
//           </Link>
//         </div>

//         <div className="sm:hidden flex-1 flex items-center justify-end cursor-pointer">
//           {isMenuOpen ? (
//             <CloseIcon
//               className="text-slate-800"
//               onClick={() => setIsMenuOpen(false)}
//             />
//           ) : (
//             <HamburgerIcon
//               className="text-slate-800"
//               onClick={() => setIsMenuOpen(true)}
//             />
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Header;
