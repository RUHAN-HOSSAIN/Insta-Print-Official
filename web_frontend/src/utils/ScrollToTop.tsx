import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpIcon } from "../assets/icons/Icons";

const ScrollToTop = () => {
  const [isPastHalfOfHome, setIsPastHalfOfHome] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTemporarilyVisible, setIsTemporarilyVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const startHideTimer = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => setIsTemporarilyVisible(false), 1500);
  }, [clearHideTimer]);

  useEffect(() => {
    const handleScroll = () => {
      const homeSection = document.getElementById("home");
      if (!homeSection) return;

      const scrolledPastHalf =
        window.scrollY >= homeSection.offsetTop + homeSection.offsetHeight / 2;
      setIsPastHalfOfHome(scrolledPastHalf);
      if (scrolledPastHalf) {
        setIsTemporarilyVisible(true);
        if (!isHovering) startHideTimer();
      } else {
        setIsTemporarilyVisible(false);
        clearHideTimer();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      clearHideTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHovering, startHideTimer, clearHideTimer]);

  const shouldShowButton = isPastHalfOfHome && (isHovering || isTemporarilyVisible);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => {
        setIsHovering(true);
        clearHideTimer();
        setIsTemporarilyVisible(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        startHideTimer();
      }}
      aria-label="Scroll to top"
      className={`fixed bottom-7 right-7 z-50 cursor-pointer rounded-full border border-slate-200 bg-white p-2 shadow-xl transition-all duration-300 hover:scale-110 ${shouldShowButton ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"}`}
    >
      <ArrowUpIcon className="text-blue-500" />
    </button>
  );
};

export default ScrollToTop;