"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PRTimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-zinc-400">No pull request activity in this period yet.</p>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#ccc" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#ccc" }} />
          <Tooltip contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }} />
          <Bar dataKey="prs" fill="#a78bfa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}