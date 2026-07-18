"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimezoneDetector() {
  const router = useRouter();

  useEffect(() => {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const existingTz = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tz="))
      ?.split("=")[1];

    if (existingTz !== detectedTz) {
      document.cookie = `tz=${detectedTz}; path=/; max-age=31536000`;
      router.refresh();
    }
  }, []);

  return null;
}