"use client";

import React from "react";

// --- Utilities ---
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function parseTimeToSeconds(input: string): number | null {
  // Accepts: HH:MM:SS, H:MM:SS, MM:SS, M:SS, or plain seconds
  if (!input || input.trim() === "") return null;
  const s = input.trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10); // seconds only
  const parts = s.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || isNaN(Number(p)))) return null;
  let h = 0,
    m = 0,
    sec = 0;
  if (parts.length === 2) {
    [m, sec] = parts.map(Number);
  } else if (parts.length === 3) {
    [h, m, sec] = parts.map(Number);
  } else {
    return null;
  }
  if (m < 0 || m > 59 || sec < 0 || sec > 59 || h < 0) return null;
  return h * 3600 + m * 60 + sec;
}

function formatSecondsToHHMMSS(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = sec.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function parsePaceToSecPerKm(input: string): number | null {
  // Accepts: MM:SS or M:SS
  if (!input || input.trim() === "") return null;
  const s = input.trim();
  const parts = s.split(":");
  if (parts.length !== 2) return null;
  const [mStr, sStr] = parts;
  if (mStr === "" || sStr === "") return null;
  const m = Number(mStr);
  const sec = Number(sStr);
  if ([m, sec].some((x) => isNaN(x))) return null;
  if (m < 0 || sec < 0 || sec > 59) return null;
  return m * 60 + sec;
}

function formatSecPerKmToPace(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const PRESET_DISTANCES = [
  { label: "1 km", km: 1 },
  { label: "5 km", km: 5 },
  { label: "10 km", km: 10 },
  { label: "Half Marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

export default function PaceCalculator() {
  const [pace, setPace] = React.useState(""); // mm:ss per unit
  const [distance, setDistance] = React.useState(""); // numeric in current unit
  const [time, setTime] = React.useState(""); // hh:mm:ss or mm:ss
  const [lastEdited, setLastEdited] = React.useState<"pace" | "distance" | "time" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [unit, setUnit] = React.useState<"km" | "mi">("km");

  const KM_PER_MILE = 1.609344;

  // Derived numeric values (internally work in seconds per *current unit*)
  const paceSec = parsePaceToSecPerKm(pace); // interpret as sec per current unit
  const distVal = distance.trim() === "" ? null : Number(distance.replace(",", "."));
  const timeSec = parseTimeToSeconds(time);

  const exactlyTwoFilled = [paceSec != null, distVal != null && !isNaN(distVal), timeSec != null].filter(Boolean).length === 2;

  // Auto-calc missing field when two present
  React.useEffect(() => {
    setError(null);
    if (!exactlyTwoFilled) return;

    if (paceSec != null && distVal != null && timeSec == null) {
      // time = pace * distance
      const t = paceSec * distVal;
      setTime(formatSecondsToHHMMSS(t));
    } else if (paceSec != null && timeSec != null && (distVal == null || isNaN(distVal))) {
      if (paceSec <= 0) return setError("Pace must be > 0");
      const d = timeSec / paceSec;
      setDistance((Math.round(d * 1000) / 1000).toString());
    } else if (paceSec == null && distVal != null && timeSec != null) {
      if (distVal <= 0) return setError("Distance must be > 0");
      const p = timeSec / distVal;
      setPace(formatSecPerKmToPace(p));
    }
  }, [paceSec, distVal, timeSec, exactlyTwoFilled]);

  // Keep all three consistent using lastEdited
  React.useEffect(() => {
    if ([paceSec != null, distVal != null && !isNaN(distVal), timeSec != null].every(Boolean)) {
      if ((lastEdited === "pace" || lastEdited === "distance") && paceSec != null && distVal != null) {
        setTime(formatSecondsToHHMMSS(paceSec * distVal));
      } else if (lastEdited === "time" && timeSec != null && distVal != null) {
        if (distVal > 0) setPace(formatSecPerKmToPace(timeSec / distVal));
      }
    }
  }, [paceSec, distVal, timeSec, lastEdited]);

  // Convert current pace (sec per unit) regardless of which two fields are filled
  const currentPaceSec = ((): number | null => {
    if (paceSec != null) return paceSec; // already per current unit
    if (timeSec != null && distVal && distVal > 0) return timeSec / distVal;
    return null;
  })();

  // Preset distances depending on unit
  const PRESETS = unit === "km"
    ? [
        { label: "1 km", value: 1 },
        { label: "5 km", value: 5 },
        { label: "10 km", value: 10 },
        { label: "Half Marathon", value: 21.0975 },
        { label: "Marathon", value: 42.195 },
      ]
    : [
        { label: "1 mi", value: 1 },
        { label: "5K (3.11 mi)", value: 3.10686 },
        { label: "10K (6.21 mi)", value: 6.21371 },
        { label: "Half Marathon (13.11 mi)", value: 13.1094 },
        { label: "Marathon (26.22 mi)", value: 26.2188 },
      ];

  const rows = PRESETS.map(({ label, value }) => {
    const finish = currentPaceSec != null ? currentPaceSec * value : null;
    return { label, distance: value, time: finish != null ? formatSecondsToHHMMSS(finish) : "—" };
  });

  function handleReset() {
    setPace("");
    setDistance("");
    setTime("");
    setLastEdited(null);
    setError(null);
  }

  function toggleUnit(next: "km" | "mi") {
    if (next === unit) return;
    // Convert existing values numerically between km and mi.
    // dist: km <-> mi, pace: sec per km <-> sec per mi
    const kmToMi = (km: number) => km / KM_PER_MILE;
    const miToKm = (mi: number) => mi * KM_PER_MILE;

    const convertDist = (val: string) => {
      const n = Number(val.replace(",", "."));
      if (isNaN(n)) return val;
      const converted = next === "mi" ? kmToMi(n) : miToKm(n);
      return (Math.round(converted * 1000) / 1000).toString();
    };

    const convertPace = (val: string) => {
      const p = parsePaceToSecPerKm(val);
      if (p == null) return val;
      const convertedSec = next === "mi" ? p * KM_PER_MILE : p / KM_PER_MILE;
      return formatSecPerKmToPace(convertedSec);
    };

    setDistance((d) => (d.trim() ? convertDist(d) : d));
    setPace((p) => (p.trim() ? convertPace(p) : p));
    // time remains the same

    setUnit(next);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Pace Calculator</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Enter any two fields. Units: <span className="font-medium">{unit}</span> and <span className="font-medium">min/{unit}</span>.</p>
          </div>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm dark:bg-slate-800">
            <button
              onClick={() => toggleUnit("km")}
              className={`rounded-xl px-3 py-2 font-medium transition ${unit === "km" ? "bg-gradient-to-b from-amber-400 to-orange-500 text-slate-900 shadow" : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
              aria-pressed={unit === "km"}
            >
              km
            </button>
            <button
              onClick={() => toggleUnit("mi")}
              className={`rounded-xl px-3 py-2 font-medium transition ${unit === "mi" ? "bg-gradient-to-b from-amber-400 to-orange-500 text-slate-900 shadow" : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
              aria-pressed={unit === "mi"}
            >
              mi
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="group relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/30 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Pace (min/{unit})</span>
              <input
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                onFocus={() => setLastEdited("pace")}
                placeholder={unit === "km" ? "4:30" : "7:15"}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                inputMode="numeric"
                aria-label={`Pace in minutes per ${unit}`}
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Format: mm:ss</span>
            </label>

            <label className="group relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/30 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Distance ({unit})</span>
              <input
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                onFocus={() => setLastEdited("distance")}
                placeholder={unit === "km" ? "10" : "6.2"}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                inputMode="decimal"
                aria-label={`Distance in ${unit}`}
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Use a dot or comma for decimals</span>
            </label>

            <label className="group relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/30 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Time (hh:mm:ss)</span>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onFocus={() => setLastEdited("time")}
                placeholder="45:00"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                inputMode="numeric"
                aria-label="Finish time"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Also accepts mm:ss</span>
            </label>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {currentPaceSec != null ? (
                <>Current pace: <span className="font-medium text-slate-700 dark:text-white">{formatSecPerKmToPace(currentPaceSec)} min/{unit}</span></>
              ) : (
                <>Current pace: —</>
              )}
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Finish times at your pace</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Calculated using the current pace. Update any field above to refresh.</p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Distance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{unit === "km" ? "Kilometers" : "Miles"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Finish Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950/50">
                  {rows.map((r) => (
                    <tr key={r.label} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{r.label}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{(Math.round(r.distance * 1000) / 1000).toString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Tip: Enter <span className="font-medium text-slate-700 dark:text-white">distance + time</span> to derive pace, or <span className="font-medium text-slate-700 dark:text-white">pace + time</span> to derive distance.
      </div>
    </div>
  );
}
