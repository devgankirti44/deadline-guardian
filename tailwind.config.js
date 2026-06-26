/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        guardian: {
          black: "#0D0D0D",
          charcoal: "#141414",
          panel: "#1A1A1A",
          border: "#2A2A2A",
          hover: "#222222",
        },
        // Amber - Primary brand
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Neon green - Safe/Active status
        neon: {
          green: "#10B981",
          greenDim: "#059669",
          greenDark: "#064E3B",
          greenGlow: "#34D399",
        },
        // Red - Critical only
        crisis: {
          red: "#EF4444",
          redDark: "#DC2626",
          redDim: "#7F1D1D",
          redGlow: "#F87171",
        },
        // Text
        text: {
          primary: "#E5E5E5",
          secondary: "#A3A3A3",
          muted: "#6B7280",
          amber: "#FCD34D",
          green: "#34D399",
          red: "#F87171",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        // Radar
        "radar-sweep": "radarSweep 3s linear infinite",
        "radar-ping": "radarPing 2s ease-out infinite",
        // Status
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "pulse-amber": "pulseAmber 2s ease-in-out infinite",
        "pulse-red": "pulseRed 1s ease-in-out infinite",
        // Data
        "data-stream": "dataStream 8s linear infinite",
        "scan-line": "scanLine 4s linear infinite",
        // UI
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "blink": "blink 1s step-end infinite",
        "ticker": "ticker 20s linear infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        radarPing: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 4px #10B981, 0 0 8px #10B981" },
          "50%": { boxShadow: "0 0 8px #10B981, 0 0 20px #10B981, 0 0 30px #10B981" },
        },
        pulseAmber: {
          "0%, 100%": { boxShadow: "0 0 4px #F59E0B, 0 0 8px #F59E0B" },
          "50%": { boxShadow: "0 0 8px #F59E0B, 0 0 20px #F59E0B, 0 0 30px #F59E0B" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 4px #EF4444, 0 0 8px #EF4444" },
          "50%": { boxShadow: "0 0 8px #EF4444, 0 0 20px #EF4444, 0 0 40px #EF4444" },
        },
        dataStream: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      boxShadow: {
        "amber-glow": "0 0 20px rgba(245, 158, 11, 0.3)",
        "amber-glow-lg": "0 0 40px rgba(245, 158, 11, 0.4)",
        "green-glow": "0 0 20px rgba(16, 185, 129, 0.3)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.4)",
        "panel": "0 4px 24px rgba(0, 0, 0, 0.8)",
        "inner-amber": "inset 0 0 30px rgba(245, 158, 11, 0.05)",
      },
      backgroundImage: {
        "grid-pattern": 
          "linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)",
        "radar-gradient":
          "radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)",
        "panel-gradient":
          "linear-gradient(135deg, #1A1A1A 0%, #141414 100%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};