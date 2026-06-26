"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  X, 
  Check, 
  RotateCcw,
  Volume2,
  VolumeX,
  Coffee,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const FOCUS_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes

export const FocusMode = ({ task, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus"); // focus, break
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      // Use Web Audio API for beep sounds
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === "start") {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (type === "complete") {
        // Triple beep for completion
        [800, 1000, 1200].forEach((freq, i) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.15;
            osc.start();
            osc.stop(audioContext.currentTime + 0.15);
          }, i * 200);
        });
      } else if (type === "break") {
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleTimerComplete = () => {
    playSound("complete");
    setIsRunning(false);
    
    if (mode === "focus") {
      import("@/lib/voiceEngine").then(({ getVoiceEngine }) => {
      const engine = getVoiceEngine();
      if (engine) engine.focusBreak();
    });

      const newSessions = sessions + 1;
      setSessions(newSessions);
      toast.success("🎉 Focus session complete! Take a break.", {
        duration: 5000,
        style: { background: "#10B981", color: "#000" }
      });
      // Start break
      setMode("break");
      setTimeLeft(newSessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
    } else {
      toast("☕ Break over! Ready for another session?", {
        duration: 5000,
        icon: "💪",
      });
      setMode("focus");
      setTimeLeft(FOCUS_DURATION);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    playSound("start");

const handleStart = () => {
  setIsRunning(true);
  playSound("start");
  
  // ADD THIS
  
  toast.success(mode === "focus" ? "🎯 Focus mode activated!" : "☕ Break started");
};


    toast.success(mode === "focus" ? "🎯 Focus mode activated!" : "☕ Break started");
  };

  const handlePause = () => {
    setIsRunning(false);
    toast("Paused", { icon: "⏸" });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_DURATION : (sessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK));
    toast("Timer reset", { icon: "🔄" });
  };

  const handleComplete = () => {
    import("@/lib/voiceEngine").then(({ getVoiceEngine }) => {
    const engine = getVoiceEngine();
    if (engine) engine.missionComplete(task.title);
  });
    onComplete(task.id);
    toast.success("Mission completed! 🏆", {
      duration: 4000,
      style: { background: "#10B981", color: "#000" }
    });
    setTimeout(() => onClose(), 1500);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Progress percentage
  const totalDuration = mode === "focus" ? FOCUS_DURATION : (sessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const isBreak = mode === "break";
  const themeColor = isBreak ? "#10B981" : "#F59E0B";
  const themeColorBg = isBreak ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 transition-all hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          color: "#6B7280",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
        title="Exit focus mode"
      >
        <X size={20} />
      </button>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-6 right-20 p-3 transition-all hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          color: soundEnabled ? themeColor : "#6B7280",
        }}
        title={soundEnabled ? "Mute" : "Unmute"}
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {/* Main Content */}
      <div className="w-full max-w-2xl text-center">
        
        {/* Mode Label */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: themeColorBg,
              border: `1px solid ${themeColor}40`,
            }}
          >
            {isBreak ? (
              <Coffee size={14} color={themeColor} />
            ) : (
              <Zap size={14} color={themeColor} />
            )}
            <span
              className="text-xs font-bold tracking-wider"
              style={{ 
                color: themeColor, 
                fontFamily: "JetBrains Mono, monospace" 
              }}
            >
              {isBreak ? "BREAK TIME" : "FOCUS MODE"} • SESSION {sessions + 1}
            </span>
          </div>

          <h1
            className="font-bold mb-2"
            style={{
              color: "#FAFAFA",
              fontSize: "32px",
              fontFamily: "Inter, sans-serif",
              lineHeight: "1.2",
            }}
          >
            {isBreak ? "Take a Break ☕" : task.title}
          </h1>

          {!isBreak && task.description && (
            <p style={{ color: "#A3A3A3", fontSize: "15px" }}>
              {task.description}
            </p>
          )}

          {isBreak && (
            <p style={{ color: "#A3A3A3", fontSize: "15px" }}>
              {sessions % 4 === 0 
                ? "Long break! Stretch, walk, hydrate. 15 minutes." 
                : "Quick break. Rest your mind. 5 minutes."}
            </p>
          )}
        </div>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          {/* Background Circle */}
          <svg
            className="absolute inset-0 transform -rotate-90"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={themeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 879.6} 879.6`}
              style={{
                transition: "stroke-dasharray 1s linear",
                filter: `drop-shadow(0 0 12px ${themeColor})`,
              }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="font-bold tracking-wider mb-2"
              style={{
                color: themeColor,
                fontSize: "72px",
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: "1",
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 30px ${themeColor}60`,
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <div
              className="text-xs tracking-wider"
              style={{
                color: "#6B7280",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {Math.round(progress)}% COMPLETE
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-3 px-8 py-4 font-bold transition-all hover:scale-105"
              style={{
                background: themeColor,
                color: "#0D0D0D",
                borderRadius: "12px",
                fontSize: "16px",
                boxShadow: `0 0 30px ${themeColor}40`,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Play size={20} fill="#0D0D0D" />
              {timeLeft === totalDuration ? "START" : "RESUME"}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-3 px-8 py-4 font-bold transition-all hover:scale-105"
              style={{
                background: "transparent",
                color: themeColor,
                border: `2px solid ${themeColor}`,
                borderRadius: "12px",
                fontSize: "16px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Pause size={20} />
              PAUSE
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-4 transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#6B7280",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            title="Reset timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div
              className="font-bold mb-1"
              style={{
                color: "#F59E0B",
                fontSize: "24px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {sessions}
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              SESSIONS
            </div>
          </div>
          <div
            style={{
              width: "1px",
              height: "30px",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div className="text-center">
            <div
              className="font-bold mb-1"
              style={{
                color: "#10B981",
                fontSize: "24px",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {Math.round(sessions * 25)}m
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              FOCUSED
            </div>
          </div>
          {task.estimatedHours && (
            <>
              <div
                style={{
                  width: "1px",
                  height: "30px",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <div className="text-center">
                <div
                  className="font-bold mb-1"
                  style={{
                    color: "#FCD34D",
                    fontSize: "24px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {task.estimatedHours}h
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>
                  ESTIMATED
                </div>
              </div>
            </>
          )}
        </div>

        {/* Complete Mission Button */}
        {!isBreak && (
          <button
            onClick={handleComplete}
            className="inline-flex items-center gap-2 px-6 py-3 transition-all hover:scale-105"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#10B981",
              border: "2px solid #10B981",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Check size={16} />
            MARK MISSION COMPLETE
          </button>
        )}

        {/* Motivational Message */}
        <p
          className="mt-8 text-sm"
          style={{ color: "#4B5563", fontStyle: "italic" }}
        >
          {isBreak 
            ? '"Rest when you\'re weary. Refresh and renew yourself."' 
            : isRunning
            ? '"Focus is a matter of deciding what things you\'re not going to do."'
            : '"The secret of getting ahead is getting started."'}
        </p>
      </div>
    </div>
  );
};