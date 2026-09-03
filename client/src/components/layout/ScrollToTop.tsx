import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";

/**
 * ScrollToTop component
 * Ensures that whenever navigation occurs (route changes, query param changes,
 * browser back/forward, or clicking links), the window resets to the top
 * (scroll position 0, 0) instead of retaining the previous page's scroll position.
 */
export default function ScrollToTop() {
  const [pathname] = useLocation();
  const search = useSearch();

  useEffect(() => {
    // Disable automatic browser scroll restoration so the browser
    // doesn't retain or asynchronously restore the previous scroll position
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      // If there's an anchor hash target in the URL (e.g. #section), scroll to that element
      if (window.location.hash) {
        const hashId = decodeURIComponent(window.location.hash.substring(1));
        const element = document.getElementById(hashId);
        if (element) {
          element.scrollIntoView();
          return;
        }
      }

      // Reset window and document scroll positions to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll on route change
    scrollToTop();

    // Re-verify on next animation frame and after a brief timeout
    // to handle React Suspense lazy chunks mounting and layout recalculation
    const rafId = requestAnimationFrame(scrollToTop);
    const timerId = setTimeout(scrollToTop, 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname, search]);

  useEffect(() => {
    // Handle browser back/forward button events
    const handlePopState = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Handle clicks on links to the current page (e.g. clicking logo or header link while scrolled down)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, target="_blank", or hash-only links (#...)
      if (
        target.target === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }

      // If clicked link points to the current path, scroll to top
      const currentPath = window.location.pathname;
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === currentPath) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant" as ScrollBehavior,
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return null;
}
