"use client";
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Settings, X, Mic, MicOff } from "lucide-react";
import { getVoiceEngine } from "@/lib/voiceEngine";

export default function VoiceControl() {
  const [enabled, setEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(1.0);
  const engineRef = useRef(null);

  useEffect(() => {
    const engine = getVoiceEngine();
    if (!engine) return;

    engineRef.current = engine;
    setEnabled(engine.enabled);
    setVolume(engine.volume);
    setRate(engine.rate);

    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => setIsSpeaking(false);

    window.addEventListener("voice-started", handleStart);
    window.addEventListener("voice-ended", handleEnd);

    return () => {
      window.removeEventListener("voice-started", handleStart);
      window.removeEventListener("voice-ended", handleEnd);
    };
  }, []);

  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (engineRef.current) {
      engineRef.current.setEnabled(newEnabled);
      if (newEnabled) {
        engineRef.current.speak("Voice activated.");
      }
    }
  };

  const testVoice = () => {
    if (engineRef.current) {
      engineRef.current.speak("Guardian voice system online. I'll keep you informed.");
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (engineRef.current) engineRef.current.setVolume(value);
  };

  const handleRateChange = (value) => {
    setRate(value);
    if (engineRef.current) engineRef.current.setRate(value);
  };

  return (
    <>
      {/* Floating Voice Indicator (bottom right) */}
      <div
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
        style={{ pointerEvents: "auto" }}
      >
        {/* Speaking Indicator */}
        {isSpeaking && enabled && (
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(245,158,11,0.15))",
              border: "1px solid rgba(168,85,247,0.4)",
              borderRadius: "100px",
              animation: "voicePulse 1.5s ease-in-out infinite",
            }}
          >
            <div className="flex items-end gap-0.5" style={{ height: "16px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "3px",
                    background: "#A855F7",
                    borderRadius: "2px",
                    animation: `voiceBar 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                color: "#A855F7",
                fontSize: "11px",
                fontWeight: "600",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.1em",
              }}
            >
              AURA SPEAKING
            </span>
          </div>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 transition-all"
          style={{
            background: "rgba(13,13,13,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "50%",
            cursor: "pointer",
            color: "#F59E0B",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245,158,11,0.1)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(13,13,13,0.9)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Settings size={16} />
        </button>

        {/* Main Toggle Button */}
        <button
          onClick={toggleEnabled}
          className="relative p-4 transition-all group"
          style={{
            background: enabled
              ? "linear-gradient(135deg, #A855F7, #7C3AED)"
              : "rgba(255,255,255,0.05)",
            border: enabled ? "none" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            cursor: "pointer",
            color: enabled ? "#0D0D0D" : "#6B7280",
            boxShadow: enabled ? "0 4px 30px rgba(168,85,247,0.4)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={enabled ? "Voice ON" : "Voice OFF"}
        >
          {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          
          {/* Active dot */}
          {enabled && (
            <div
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
              style={{
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
                border: "2px solid #0D0D0D",
              }}
            />
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80"
          style={{
            background: "linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div
                style={{
                  color: "#A855F7",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "4px",
                }}
              >
                VOICE SETTINGS
              </div>
              <h3 style={{ color: "#FAFAFA", fontSize: "16px", fontWeight: "600" }}>
                Aura Configuration
              </h3>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Volume */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label
                style={{
                  color: "#A3A3A3",
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.1em",
                }}
              >
                VOLUME
              </label>
              <span
                style={{
                  color: "#A855F7",
                  fontSize: "12px",
                  fontWeight: "700",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#A855F7",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Speed */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label
                style={{
                  color: "#A3A3A3",
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.1em",
                }}
              >
                SPEED
              </label>
              <span
                style={{
                  color: "#A855F7",
                  fontSize: "12px",
                  fontWeight: "700",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {rate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#A855F7",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testVoice}
            className="w-full"
            style={{
              padding: "10px",
              background: "linear-gradient(135deg, #A855F7, #7C3AED)",
              border: "none",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              fontFamily: "JetBrains Mono, monospace",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            🎤 TEST AURA VOICE
          </button>

          <p
            style={{
              color: "#4B5563",
              fontSize: "10px",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Uses your browser's built-in voice • Works offline
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes voiceBar {
          from { height: 4px; }
          to { height: 16px; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}