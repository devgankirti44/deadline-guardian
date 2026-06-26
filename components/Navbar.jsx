"use client";
import { useState } from "react";
import { Shield, LogOut, RefreshCw, Plus, Sparkles } from "lucide-react";
import { StatusDot, SystemStatusBar } from "./shared/StatusIndicator";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const Navbar = ({
  systemStatus = "STABLE",
  onRefresh,
  onAddTask,
  onShowTemplates,
  loading = false,
  lastRun,
}) => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    toast.success("Session terminated");
    setLoggingOut(false);
  };

  const formatLastRun = (date) => {
    if (!date) return "NEVER";
    const diff = Math.round((new Date() - date) / 1000);
    if (diff < 60) return `${diff}s AGO`;
    if (diff < 3600) return `${Math.round(diff / 60)}m AGO`;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <nav
      className="flex items-center justify-between px-4 py-2 relative z-10"
      style={{
        background: "#0D0D0D",
        borderBottom: "1px solid #2A2A2A",
        height: "48px",
      }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7"
          style={{
            border: "1px solid #F59E0B",
            background: "rgba(245,158,11,0.1)",
          }}
        >
          <Shield size={14} color="#F59E0B" />
        </div>
        <div>
          <div
            className="mono-xs font-bold tracking-widest"
            style={{ color: "#F59E0B", fontSize: "11px" }}
          >
            DEADLINE GUARDIAN
          </div>
          <div className="mono-xs" style={{ color: "#4B5563", fontSize: "9px" }}>
            AI MISSION CONTROL v2.0
          </div>
        </div>
      </div>

      {/* Center: System Status */}
      <div className="hidden md:flex items-center gap-6">
        <SystemStatusBar status={systemStatus} />
        <div 
          style={{ 
            width: "1px", 
            height: "16px", 
            background: "#2A2A2A",
          }} 
        />
        <div className="flex items-center gap-2">
          <span className="mono-xs text-text-muted">LAST SCAN:</span>
          <span className="mono-xs" style={{ color: "#F59E0B" }}>
            {formatLastRun(lastRun)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Templates / Welcome */}
        {onShowTemplates && (
          <button
            onClick={onShowTemplates}
            className="btn-outline-amber flex items-center gap-1.5"
            style={{ padding: "5px 10px", fontSize: "10px" }}
            title="Show templates and welcome"
          >
            <Sparkles size={11} />
            <span className="hidden sm:inline">TEMPLATES</span>
          </button>
        )}

        {/* Add Task */}
        <button
          onClick={onAddTask}
          className="btn-amber flex items-center gap-1.5"
          style={{ padding: "5px 12px", fontSize: "10px" }}
        >
          <Plus size={11} />
          NEW MISSION
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-outline-amber flex items-center gap-1.5"
          style={{ padding: "5px 10px", fontSize: "10px" }}
          title="Run AI Agents"
        >
          <RefreshCw
            size={11}
            className={loading ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">SCAN</span>
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2 pl-2"
            style={{ borderLeft: "1px solid #2A2A2A" }}>
            <div className="hidden sm:flex items-center gap-1.5">
              <StatusDot status="green" size="xs" />
              <span className="mono-xs text-text-muted truncate max-w-24">
                {user.displayName?.split(" ")[0]?.toUpperCase() || "OPERATOR"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-text-muted hover:text-crisis-red transition-colors p-1"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};