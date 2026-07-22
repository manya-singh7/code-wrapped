"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ locations }) {
  if (!locations || locations.length === 0) {
    return <p className="text-zinc-400">No contributor locations found yet.</p>;
  }

  return (
    <div className="w-full max-w-2xl">
      <ComposableMap projectionConfig={{ scale: 180 }} className="w-full h-96">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#333"
                stroke="#555"
                style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
              />
            ))
          }
        </Geographies>
        {locations.map((loc, i) => (
          <Marker key={i} coordinates={[loc.lng, loc.lat]}>
            <circle
              r={5}
              fill={loc.direction === "incoming" ? "#22d3ee" : "#f472b6"}
              stroke="#fff"
              strokeWidth={(loc.fromBio || loc.fromReadme) ? 2 : 1}
              strokeDasharray={(loc.fromBio || loc.fromReadme) ? "2,1" : "0"}
            />
          </Marker>
        ))}
      </ComposableMap>
      <div className="mt-4 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#22d3ee]"></span>
          Contributed to my work
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#f472b6]"></span>
          I contributed to their work
        </span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-zinc-300">
        {locations.map((loc, i) => (
          <span key={i} className="bg-white/10 rounded-full px-3 py-1">
            @{loc.username} · {loc.location}
          </span>
        ))}
      </div>
    </div>
  );
}