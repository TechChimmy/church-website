"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Reads the `?scrollTo=<elementId>` query param on mount and smoothly
 * scrolls to that element. Cleans the param from the URL afterward
 * so the browser history stays clean.
 */
export default function ScrollToAnchor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const target = searchParams.get("scrollTo");
    if (!target) return;

    const el = document.getElementById(target);
    if (el) {
      // Slight delay lets the page finish painting before scrolling
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      // Clean the query param from the URL without adding a history entry
      router.replace(pathname, { scroll: false });
      return () => clearTimeout(t);
    }
  }, [searchParams, router, pathname]);

  return null;
}
