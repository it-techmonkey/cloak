"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRef = useRef(`${pathname}${searchParams}`);

  useEffect(() => {
    const current = `${pathname}${searchParams}`;

    if (current !== prevRef.current) {
      // Navigation completed
      prevRef.current = current;
      setWidth(100);

      const done = setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 300);

      return () => clearTimeout(done);
    }
  }, [pathname, searchParams]);

  // Simulate progress while waiting for a page to load.
  // We can't hook into Next.js's router events directly in App Router,
  // so we start the bar on link clicks via a global click listener.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;

      setLoading(true);
      setWidth(15);

      let w = 15;
      timerRef.current = setInterval(() => {
        // Gradually slow down toward 85% — never completes on its own
        w = w + (85 - w) * 0.12;
        setWidth(w);
      }, 200);
    }

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Stop the interval when navigation completes
  useEffect(() => {
    if (width === 100 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [width]);

  if (!loading && width === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div
        className="h-full bg-foreground transition-all duration-200 ease-out"
        style={{ width: `${width}%`, opacity: loading || width < 100 ? 1 : 0 }}
      />
    </div>
  );
}
