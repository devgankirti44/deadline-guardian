"use client";
import { useEffect, useRef } from "react";
import { getVoiceEngine } from "@/lib/voiceEngine";

export const useVoice = () => {
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = getVoiceEngine();
  }, []);

  return {
    speak: (text, options) => engineRef.current?.speak(text, options),
    greeting: (name) => engineRef.current?.greeting(name),
    dailyBriefing: (stats) => engineRef.current?.dailyBriefing(stats),
    taskAdded: (title, deadline) => engineRef.current?.taskAdded(title, deadline),
    criticalAlert: (title, hours) => engineRef.current?.criticalAlert(title, hours),
    focusStart: (title) => engineRef.current?.focusStart(title),
    focusBreak: () => engineRef.current?.focusBreak(),
    missionComplete: (title) => engineRef.current?.missionComplete(title),
    encouragement: () => engineRef.current?.encouragement(),
    warning: (msg) => engineRef.current?.warning(msg),
    stop: () => engineRef.current?.stop(),
  };
};