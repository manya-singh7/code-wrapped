export default function ContributionHeatmap({ weeks, size = "normal" }) {
  if (!weeks || weeks.length === 0) return null;

  const cellSize = size === "small" ? 8 : 12;
  const gap = size === "small" ? 2 : 3;

  const getColor = (count) => {
    if (count === 0) return "#141922";
    if (count === 1) return "#0e4429";
    if (count <= 3) return "#006d32";
    if (count <= 6) return "#26a641";
    return "#39d353";
  };

  // Figure out which weeks start a new month, for labels
  const monthLabels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const month = firstDay.date.split("-")[1];
      if (month !== lastMonth) {
        monthLabels.push({ weekIndex: wi, label: new Date(firstDay.date).toLocaleDateString("en-US", { month: "short" }) });
        lastMonth = month;
      }
    }
  });

  const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="inline-block">
      <div className="flex ml-8" style={{ gap: `${gap}px` }}>
        {weeks.map((_, wi) => {
          const label = monthLabels.find((m) => m.weekIndex === wi);
          return (
            <div key={wi} style={{ width: cellSize, fontSize: 10 }} className="text-zinc-400">
              {label ? label.label : ""}
            </div>
          );
        })}
      </div>
      <div className="flex mt-1">
        <div className="flex flex-col mr-2" style={{ gap: `${gap}px` }}>
          {weekdayLabels.map((label, i) => (
            <div key={i} style={{ height: cellSize, fontSize: 10 }} className="text-zinc-400 flex items-center">
              {label}
            </div>
          ))}
        </div>
        <div className="flex" style={{ gap: `${gap}px` }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 2,
                    backgroundColor: getColor(day.count),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}