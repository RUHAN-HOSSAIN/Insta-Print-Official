import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";

const scrollToHash = (hash: string) => {
  if (!hash) return;

  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const syncHeaderHeightVariable = (
  headerElement: HTMLElement | null,
  variableName = "--header-height",
) => {
  if (!headerElement) return () => {};

  const rootElement = document.documentElement;
  const updateHeaderHeight = () => {
    rootElement.style.setProperty(
      variableName,
      `${headerElement.getBoundingClientRect().height}px`,
    );
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
  closeMenu?: () => void;
};

export const handleHeaderNavClick = ({
  event,
  to,
  pathname,
  closeMenu,
}: HandleHeaderNavClickParams) => {
  closeMenu?.();
  if (!to.startsWith("/")) return;

  const [targetPath, targetHashValue] = to.split("#");
  const normalizedPath = targetPath || "/";
  const targetHash = targetHashValue ? `#${targetHashValue}` : "";
  if (normalizedPath !== "/" || pathname !== "/") return;

  event.preventDefault();
  window.history.replaceState(null, "", targetHash ? to : "/");
  if (targetHash) {
    scrollToHash(targetHash);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const useRootRouteSmoothScroll = (pathname: string, hash: string) => {
  useEffect(() => {
    if (pathname !== "/") return;

    const runScroll = () => {
      if (hash) {
        scrollToHash(hash);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.requestAnimationFrame(() => window.requestAnimationFrame(runScroll));
  }, [pathname, hash]);
};

export const useHeaderHeightCssVar = () => {
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => syncHeaderHeightVariable(headerRef.current), []);
  return headerRef;
};