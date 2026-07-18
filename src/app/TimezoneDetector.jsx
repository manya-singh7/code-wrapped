"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TimezoneDetector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const existingTz = searchParams.get("tz");
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!existingTz || existingTz !== detectedTz) {
      const params = new URLSearchParams(searchParams);
      params.set("tz", detectedTz);
      router.replace(`?${params.toString()}`);
    }
  }, []);

  return null;
}