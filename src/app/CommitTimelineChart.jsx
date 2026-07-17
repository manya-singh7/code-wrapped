"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CommitTimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-zinc-400">No commit activity in this period yet.</p>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#ccc" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#ccc" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }}
          />
          <Line type="monotone" dataKey="commits" stroke="#22d3ee" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}