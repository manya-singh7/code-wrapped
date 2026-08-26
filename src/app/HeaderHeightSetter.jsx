"use client";

import { useEffect } from "react";

export default function HeaderHeightSetter() {
  useEffect(() => {
    const updateHeight = () => {
      const header = document.getElementById("site-header");
      if (header) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${header.offsetHeight}px`
        );
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Re-measure periodically in case content shifts (e.g., dropdown opens)
    const interval = setInterval(updateHeight, 500);

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearInterval(interval);
    };
  }, []);

  return null;
}