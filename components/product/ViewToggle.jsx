"use client";
import { Activity, LayoutGrid } from "lucide-react";

export const ViewToggle = ({ view, onChange }) => {
  return (
    <div
      className="inline-flex p-1 rounded-lg"
      style={{ background: "#141414", border: "1px solid #2A2A2A" }}
    >
      <button
        onClick={() => onChange("product")}
        className="flex items-center gap-2 px-4 py-2 rounded-md transition-all"
        style={{
          background: view === "product" ? "rgba(245,158,11,0.15)" : "transparent",
          color: view === "product" ? "#F59E0B" : "#6B7280",
        }}
      >
        <LayoutGrid size={14} />
        <span
          className="text-xs font-bold tracking-wider"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          FOCUS VIEW
        </span>
      </button>
      <button
        onClick={() => onChange("mission")}
        className="flex items-center gap-2 px-4 py-2 rounded-md transition-all"
        style={{
          background: view === "mission" ? "rgba(245,158,11,0.15)" : "transparent",
          color: view === "mission" ? "#F59E0B" : "#6B7280",
        }}
      >
        <Activity size={14} />
        <span
          className="text-xs font-bold tracking-wider"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          MISSION CONTROL
        </span>
      </button>
    </div>
  );
};