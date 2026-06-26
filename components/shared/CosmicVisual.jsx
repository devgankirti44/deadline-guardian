"use client";

export const CosmicVisual = ({ criticalCount = 0, hasAlerts = false }) => {
  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "420px",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 600 500"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        <defs>
          {/* Planet gradient */}
          <radialGradient id="planetGlow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#D97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1A0A00" stopOpacity="0.8" />
          </radialGradient>

          {/* Outer atmosphere glow */}
          <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.15" />
          </radialGradient>

          {/* Orbit gradient */}
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245,158,11,0)" />
            <stop offset="50%" stopColor="rgba(245,158,11,0.4)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </linearGradient>

          <filter id="planetBlur">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Outer orbit ring */}
        <ellipse
          cx="300"
          cy="250"
          rx="280"
          ry="100"
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="1"
          opacity="0.5"
          transform="rotate(-20 300 250)"
        />

        {/* Middle orbit ring */}
        <ellipse
          cx="300"
          cy="250"
          rx="240"
          ry="80"
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="1"
          opacity="0.3"
          transform="rotate(-25 300 250)"
        />

        {/* Inner orbit ring */}
        <ellipse
          cx="300"
          cy="250"
          rx="200"
          ry="65"
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="1"
          opacity="0.25"
          transform="rotate(-15 300 250)"
        />

        {/* Outer atmosphere */}
        <circle cx="300" cy="250" r="180" fill="url(#atmosphere)" />

        {/* Main planet */}
        <circle
          cx="300"
          cy="250"
          r="120"
          fill="url(#planetGlow)"
          filter="url(#planetBlur)"
        />

        {/* Planet highlight (top-left) */}
        <ellipse
          cx="260"
          cy="210"
          rx="35"
          ry="20"
          fill="rgba(252,211,77,0.3)"
          opacity="0.6"
        />

        {/* Planet shadow */}
        <circle
          cx="320"
          cy="270"
          r="100"
          fill="rgba(0,0,0,0.6)"
        />

        {/* Orbit dots (animated) */}
        <circle cx="80" cy="200" r="2" fill="#F59E0B" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="540" cy="280" r="2" fill="#F59E0B" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="450" cy="160" r="1.5" fill="#FCD34D" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="320" r="1.5" fill="#FCD34D" opacity="0.6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="4.5s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Active Threats Indicator (overlaid) */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: "55%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#FCD34D",
            letterSpacing: "0.2em",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "8px",
          }}
        >
          ACTIVE THREATS
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: "700",
            color: "#F59E0B",
            fontFamily: "JetBrains Mono, monospace",
            lineHeight: "1",
            textShadow: "0 0 30px rgba(245,158,11,0.5)",
          }}
        >
          {criticalCount}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#A3A3A3",
            marginTop: "8px",
            maxWidth: "180px",
          }}
        >
          {criticalCount === 0
            ? "All systems running smoothly"
            : "Needs your immediate attention"}
        </div>
      </div>

      {/* All Systems Nominal Badge (top right) */}
      {!hasAlerts && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "5%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(16,185,129,0.15)",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#10B981",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.15em",
              textAlign: "center",
              fontWeight: "600",
              lineHeight: "1.4",
            }}
          >
            ALL SYSTEMS
            <br />
            NOMINAL
          </div>
          <svg width="40" height="12" viewBox="0 0 40 12" style={{ marginTop: "6px" }}>
            <path
              d="M0,6 L8,6 L10,2 L14,10 L18,4 L22,8 L26,6 L40,6"
              stroke="#10B981"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
};