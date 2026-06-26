"use client";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

// ═══════════════════════════════════════════════
// 🧠 SMART AI CACHE MANAGER (DEMO-SAFE)
// - Task-specific stable keys
// - Stale fallback when Gemini fails
// - 7-day TTL for demo reliability
// ═══════════════════════════════════════════════

// TTL per agent type (in minutes) - 7 days = demo safe
const CACHE_TTL = {
  risk: 10080,
  crisis: 10080,
  breakdown: 10080,
  schedule: 10080,
  orchestrator: 10080,
  focus: 10080,
  recovery: 10080,
  conflict: 10080,
  email: 10080,
  default: 10080,
};

// ─── Stable stringify (sorts keys recursively) ─────
const stableStringify = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(",")}}`;
};

// ─── Safe string for Firestore doc IDs ─────────────
const safe = (val) =>
  String(val || "unknown").replace(/[\/\\#?[\]\s]/g, "_").substring(0, 60);

// ─── Cache key generator (TASK-SPECIFIC for relevant agents) ─
const generateCacheKey = (agentName, inputs = {}) => {
  try {
    // Task-specific agents → readable stable keys
    if (agentName === "recovery" && inputs.taskId) {
      return `recovery_${safe(inputs.taskId)}_${safe(inputs.version || "v1")}`;
    }
    if (agentName === "breakdown" && inputs.taskId) {
      return `breakdown_${safe(inputs.taskId)}_${safe(inputs.version || "v1")}`;
    }
    if (agentName === "email" && inputs.taskId) {
      return `email_${safe(inputs.taskId)}_${safe(inputs.emailType || "default")}`;
    }

    // General agents → stable hash
    const str = stableStringify(inputs);
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${agentName}_${(hash >>> 0).toString(36)}`;
  } catch {
    return `${agentName}_${Date.now()}`;
  }
};

// ─── Freshness check ───────────────────────────────
const isCacheFresh = (cachedAt, agentName) => {
  const ttl = CACHE_TTL[agentName] || CACHE_TTL.default;
  const ageMin = (Date.now() - cachedAt) / 60000;
  return ageMin < ttl;
};

// ─── GET fresh cache ────────────────────────────────
export const getCachedResponse = async (userId, agentName, inputs) => {
  if (!userId) return null;

  try {
    const cacheKey = generateCacheKey(agentName, inputs);
    const docRef = doc(db, "aiAgentCache", `${userId}_${cacheKey}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`📭 [${agentName}] No cache (key: ${cacheKey})`);
      return null;
    }

    const data = docSnap.data();
    if (!isCacheFresh(data.cachedAt, agentName)) {
      const ageMin = Math.floor((Date.now() - data.cachedAt) / 60000);
      console.log(`⏰ [${agentName}] Cache stale (${ageMin} min)`);
      return null;
    }

    const ageMin = Math.floor((Date.now() - data.cachedAt) / 60000);
    console.log(`✅ [${agentName}] Cache HIT (${ageMin} min old, key: ${cacheKey})`);
    return data.response;
  } catch (err) {
    console.error(`❌ [${agentName}] Cache read error:`, err.message);
    return null;
  }
};

// ─── GET stale cache (fallback for API failures) ───
export const getStaleCachedResponse = async (userId, agentName, inputs) => {
  if (!userId) return null;

  try {
    const cacheKey = generateCacheKey(agentName, inputs);
    const docRef = doc(db, "aiAgentCache", `${userId}_${cacheKey}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    console.log(`🛡️ [${agentName}] Stale fallback used (key: ${cacheKey})`);
    return data.response;
  } catch {
    return null;
  }
};

// ─── SAVE to cache ──────────────────────────────────
export const saveCachedResponse = async (userId, agentName, inputs, response) => {
  if (!userId || !response) return;

  try {
    const cacheKey = generateCacheKey(agentName, inputs);
    const docRef = doc(db, "aiAgentCache", `${userId}_${cacheKey}`);

    await setDoc(docRef, {
      userId,
      agentName,
      cacheKey,
      response,
      cachedAt: Date.now(),
      createdAt: serverTimestamp(),
      inputs: JSON.stringify(inputs).substring(0, 500),
    });

    console.log(`💾 [${agentName}] Saved to cache (key: ${cacheKey})`);
  } catch (err) {
    console.error(`❌ [${agentName}] Save failed:`, err.message);
  }
};

// ─── UNIVERSAL WRAPPER ──────────────────────────────
export const withCache = async (userId, agentName, inputs, agentFunction) => {
  // 1. Try fresh cache
  const cached = await getCachedResponse(userId, agentName, inputs);
  if (cached) return cached;

  // 2. Run Gemini
  console.log(`🤖 [${agentName}] Cache miss → calling Gemini...`);
  const startTime = Date.now();

  try {
    const response = await agentFunction();
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ [${agentName}] Gemini responded in ${duration}s`);

    if (response) {
      await saveCachedResponse(userId, agentName, inputs, response);
    }
    return response;
  } catch (err) {
    console.error(`❌ [${agentName}] Gemini failed:`, err.message);

    // 3. Fallback: stale cache
    const stale = await getStaleCachedResponse(userId, agentName, inputs);
    if (stale) {
      console.log(`🛡️ [${agentName}] Using stale cache (Gemini down)`);
      return stale;
    }

    throw err;
  }
};

// ─── Delete specific cache (for "regenerate" button) ─
export const clearCacheEntry = async (userId, agentName, inputs) => {
  try {
    const cacheKey = generateCacheKey(agentName, inputs);
    await deleteDoc(doc(db, "aiAgentCache", `${userId}_${cacheKey}`));
    console.log(`🗑️ [${agentName}] Cache cleared (key: ${cacheKey})`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getCacheStats = () => ({ ttls: CACHE_TTL });