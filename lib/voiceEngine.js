// ═══════════════════════════════════════════════════
// AURA VOICE ENGINE
// Uses browser's built-in SpeechSynthesis API
// FREE, no quota limits, works offline
// ═══════════════════════════════════════════════════

class VoiceEngine {
  constructor() {
    this.isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    this.synth = this.isSupported ? window.speechSynthesis : null;
    this.voice = null;
    this.queue = [];
    this.isSpeaking = false;
    this.enabled = true;
    this.volume = 0.8;
    this.rate = 1.0;
    this.pitch = 1.0;

    if (this.isSupported) {
      this.loadVoice();
      // Voices load asynchronously
      window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
    }

    // Load user preferences
    this.loadPreferences();
  }

  loadVoice() {
    if (!this.synth) return;
    
    const voices = this.synth.getVoices();
    if (voices.length === 0) return;

    // Prefer high-quality English voices
    const preferredVoices = [
      "Google UK English Female",
      "Google US English",
      "Microsoft Aria Online",
      "Microsoft Jenny Online",
      "Samantha",
      "Karen",
      "Daniel",
    ];

    for (const name of preferredVoices) {
      const found = voices.find(v => v.name.includes(name));
      if (found) {
        this.voice = found;
        return;
      }
    }

    // Fallback: any English voice
    this.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
  }

  loadPreferences() {
    if (typeof window === "undefined") return;
    
    const enabled = localStorage.getItem("voice_enabled");
    const volume = localStorage.getItem("voice_volume");
    const rate = localStorage.getItem("voice_rate");
    
    if (enabled !== null) this.enabled = enabled === "true";
    if (volume !== null) this.volume = parseFloat(volume);
    if (rate !== null) this.rate = parseFloat(rate);
  }

  savePreferences() {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("voice_enabled", String(this.enabled));
    localStorage.setItem("voice_volume", String(this.volume));
    localStorage.setItem("voice_rate", String(this.rate));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.savePreferences();
    if (!enabled) this.stop();
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.savePreferences();
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2, rate));
    this.savePreferences();
  }

  speak(text, options = {}) {
    if (!this.isSupported || !this.enabled || !text) return;

    // Cancel current speech if interrupt requested
    if (options.interrupt) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) utterance.voice = this.voice;
    utterance.volume = options.volume ?? this.volume;
    utterance.rate = options.rate ?? this.rate;
    utterance.pitch = options.pitch ?? this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("voice-started", { detail: { text } }));
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("voice-ended"));
      }
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      console.error("Voice error:", e);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // ─── PRE-BUILT VOICE LINES ──────────────────────

  greeting(userName) {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
    else timeGreeting = "Working late tonight";

    const name = userName?.split(" ")[0] || "Operator";
    this.speak(`${timeGreeting}, ${name}. Guardian online.`);
  }

  dailyBriefing(stats) {
    const { activeTasks, criticalCount, completedToday } = stats;
    
    let message = `You have ${activeTasks} active mission${activeTasks !== 1 ? 's' : ''}. `;
    
    if (criticalCount > 0) {
      message += `${criticalCount} critical. Immediate action required. `;
    } else {
      message += `No critical threats. `;
    }
    
    if (completedToday > 0) {
      message += `${completedToday} completed today. Excellent work.`;
    } else {
      message += `Let's get started.`;
    }
    
    this.speak(message);
  }

  taskAdded(taskTitle, deadline) {
    let message = `Mission acknowledged. ${taskTitle}.`;
    
    if (deadline) {
      const hours = Math.round((new Date(deadline) - new Date()) / 3600000);
      if (hours < 24) {
        message += ` Deadline in ${hours} hours.`;
      } else {
        message += ` Deadline in ${Math.floor(hours / 24)} days.`;
      }
    }
    
    this.speak(message);
  }

  criticalAlert(taskTitle, hoursLeft) {
    this.speak(
      `Operator. Critical alert. ${taskTitle}. ${hoursLeft} hours remaining. Act now.`,
      { interrupt: true, rate: 0.95 }
    );
  }

  focusStart(taskTitle) {
    this.speak(
      `Focus session initiated. ${taskTitle}. Twenty-five minutes. Begin.`,
      { rate: 0.95 }
    );
  }

  focusBreak() {
    this.speak(
      `Excellent work. Take five minutes. Rest, hydrate, recharge.`,
      { rate: 0.95 }
    );
  }

  missionComplete(taskTitle) {
    const compliments = [
      `Mission complete. ${taskTitle}. Outstanding.`,
      `${taskTitle} accomplished. Excellent execution.`,
      `Mission successful. ${taskTitle}. Well done.`,
      `${taskTitle} complete. Maintain this momentum.`,
    ];
    const message = compliments[Math.floor(Math.random() * compliments.length)];
    this.speak(message);
  }

  encouragement() {
    const messages = [
      "You're doing great. Keep going.",
      "Steady progress. Don't stop.",
      "Focus is your superpower right now.",
      "One step at a time. You've got this.",
      "Trust the process. Execute.",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.speak(message);
  }

  warning(message) {
    this.speak(message, { rate: 0.95, pitch: 0.95 });
  }

  // Profile-based messages
  profileAware(profile, message) {
    if (!profile) {
      this.speak(message);
      return;
    }

    // Adjust tone based on personality
    const options = {};
    
    if (profile.scores?.neuroticism >= 70) {
      // Gentle, calmer tone for anxious users
      options.rate = 0.9;
      options.pitch = 1.05;
    } else if (profile.scores?.conscientiousness >= 70) {
      // Direct, efficient tone for disciplined users
      options.rate = 1.1;
    }
    
    this.speak(message, options);
  }
}

// Singleton instance
let voiceEngineInstance = null;

export const getVoiceEngine = () => {
  if (typeof window === "undefined") return null;
  if (!voiceEngineInstance) {
    voiceEngineInstance = new VoiceEngine();
  }
  return voiceEngineInstance;
};

// Convenience function for components
export const speak = (text, options) => {
  const engine = getVoiceEngine();
  if (engine) engine.speak(text, options);
};