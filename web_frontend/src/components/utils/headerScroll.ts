import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";

const scrollToHash = (hash: string) => {
  if (!hash) {
    return;
  }

  const targetSection = document.querySelector(hash);
  targetSection?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const syncHeaderHeightVariable = (
  headerElement: HTMLElement | null,
  variableName = "--header-height"
) => {
  if (!headerElement) {
    return () => {};
  }

  const rootElement = document.documentElement;

  const updateHeaderHeight = () => {
    const headerHeight = headerElement.getBoundingClientRect().height;
    rootElement.style.setProperty(variableName, `${headerHeight}px`);
  };

  updateHeaderHeight();

  const resizeObserver = new ResizeObserver(updateHeaderHeight);
  resizeObserver.observe(headerElement);
  window.addEventListener("resize", updateHeaderHeight);

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", updateHeaderHeight);
  };
};

type HandleHeaderNavClickParams = {
  event: MouseEvent<HTMLAnchorElement>;
  to: string;
  pathname: string;
  closeMenu: () => void;
};

export const handleHeaderNavClick = ({
  event,
  to,
  pathname,
  closeMenu,
}: HandleHeaderNavClickParams) => {
  closeMenu();

  if (to !== "/" || pathname !== "/") {
    return;
  }

  event.preventDefault();
  window.history.replaceState(null, "", "/");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const useHomeHashScroll = (pathname: string, hash: string) => {
  useEffect(() => {
    if (pathname !== "/" || !hash) {
      return;
    }

    scrollToHash(hash);
  }, [pathname, hash]);
};

export const useHeaderHeightCssVar = () => {
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return syncHeaderHeightVariable(headerRef.current);
  }, []);

  return headerRef;
};
