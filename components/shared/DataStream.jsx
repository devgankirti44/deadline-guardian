"use client";
import { useEffect, useState } from "react";

const STREAM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

const randomChar = () =>
  STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)];

const randomString = (len) =>
  Array.from({ length: len }, randomChar).join("");

export const DataStream = () => {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const cols = Math.floor(window.innerWidth / 20);
    const initial = Array.from({ length: Math.min(cols, 30) }, (_, i) => ({
      id: i,
      x: i * 20 + Math.random() * 10,
      speed: 2 + Math.random() * 4,
      chars: randomString(8 + Math.floor(Math.random() * 8)),
      opacity: 0.03 + Math.random() * 0.05,
      delay: Math.random() * 5,
    }));
    setStreams(initial);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {streams.map((s) => (
        <div
          key={s.id}
          className="absolute top-0 font-mono text-xs leading-5"
          style={{
            left: s.x,
            color: "#F59E0B",
            opacity: s.opacity,
            animation: `dataStream ${s.speed}s ${s.delay}s linear infinite`,
            writingMode: "vertical-rl",
            letterSpacing: "0.2em",
          }}
        >
          {s.chars}
        </div>
      ))}
    </div>
  );
};

export const TickerBar = ({ messages = [] }) => {
  const defaultMessages = [
    "DEADLINE GUARDIAN AI // MISSION CONTROL ACTIVE",
    "ALL AGENTS OPERATIONAL",
    "RISK ASSESSMENT ENGINE RUNNING",
    "MONITORING 24/7 // PROTECTING YOUR DEADLINES",
    "GEMINI AI INTELLIGENCE CORE ONLINE",
    ...messages,
  ];

  const text = defaultMessages.join("  ◆  ");

  return (
    <div
      className="ticker-wrap py-1"
      style={{
        background: "#0D0D0D",
        borderTop: "1px solid #2A2A2A",
        borderBottom: "1px solid #2A2A2A",
      }}
    >
      <span className="ticker-content text-text-muted">
        {text}&nbsp;&nbsp;&nbsp;{text}
      </span>
    </div>
  );
};