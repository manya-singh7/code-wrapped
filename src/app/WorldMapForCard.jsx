"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMapForCard({ locations }) {
  if (!locations || locations.length === 0) {
    return <p style={{ color: "#8B96A5", fontSize: 12 }}>No contributor locations found yet.</p>;
  }

  return (
    <div style={{ width: "100%" }}>
      <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "220px" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#333333"
                stroke="#555555"
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
              stroke="#ffffff"
              strokeWidth={(loc.fromBio || loc.fromReadme) ? 2 : 1}
              strokeDasharray={(loc.fromBio || loc.fromReadme) ? "2,1" : "0"}
            />
          </Marker>
        ))}
      </ComposableMap>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "16px", fontSize: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#E6EDF3" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22d3ee" }}></span>
          Contributed to my work
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#E6EDF3" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f472b6" }}></span>
          I contributed to their work
        </span>
      </div>
      <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
        {locations.map((loc, i) => (
          <span key={i} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "999px", padding: "4px 10px", fontSize: 9, color: "#E6EDF3" }}>
            @{loc.username} · {loc.location}
          </span>
        ))}
      </div>
    </div>
  );
}