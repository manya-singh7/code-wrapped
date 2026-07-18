"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CollaborationChart({ ownRepoPRs, otherRepoPRs, incomingCount }) {
  const total = ownRepoPRs + otherRepoPRs + incomingCount;

  if (total === 0) {
    return <p className="text-zinc-400">No collaboration activity in this period yet.</p>;
  }

  const data = [
    { name: "Your Repos (PRs)", value: ownRepoPRs },
    { name: "Others' Repos (PRs)", value: otherRepoPRs },
    { name: "Incoming (Contributors)", value: incomingCount },
  ].filter((d) => d.value > 0);

  const COLORS = ["#a78bfa", "#22d3ee", "#34d399"];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }} />
          <Legend wrapperStyle={{ color: "#fff", fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}