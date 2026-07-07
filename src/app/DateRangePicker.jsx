"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useRouter, useSearchParams } from "next/navigation";

export default function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "all";

  const [selectedOption, setSelectedOption] = useState(currentPeriod);
  const [range, setRange] = useState();

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    if (value !== "custom") {
      router.push(`?period=${value}`);
    }
  };

  const applyRange = (selectedRange) => {
    setRange(selectedRange);
    if (selectedRange?.from && selectedRange?.to) {
      const params = new URLSearchParams();
      params.set("from", selectedRange.from.toISOString().split("T")[0]);
      params.set("to", selectedRange.to.toISOString().split("T")[0]);
      params.set("period", "custom");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <select
        value={selectedOption}
        onChange={handleDropdownChange}
        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm"
      >
        <option value="all">All Time</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last Month</option>
        <option value="3months">Last 3 Months</option>
        <option value="6months">Last 6 Months</option>
        <option value="thisyear">This Year</option>
        <option value="lastyear">Last Year</option>
        <option value="custom">Custom Range</option>
      </select>

      {selectedOption === "custom" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={applyRange}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
          />
        </div>
      )}
    </div>
  );
}