"use client";
import { useState } from "react";
import { X, AlertTriangle, Clock, Target, Zap } from "lucide-react";
import toast from "react-hot-toast";

const PRIORITIES = [
  { value: "critical", label: "CRITICAL", color: "#EF4444" },
  { value: "high", label: "HIGH", color: "#F59E0B" },
  { value: "medium", label: "MEDIUM", color: "#FCD34D" },
  { value: "low", label: "LOW", color: "#10B981" },
];

const CATEGORIES = [
  "Work", "Project", "Assignment",
  "Meeting", "Personal", "Finance",
  "Health", "Learning", "Other",
];

export const TaskModal = ({ onClose, onSave, editTask = null }) => {
  const [form, setForm] = useState({
    title: editTask?.title || "",
    description: editTask?.description || "",
    deadline: editTask?.deadline
      ? new Date(editTask.deadline).toISOString().slice(0, 16)
      : "",
    priority: editTask?.priority || "medium",
    estimatedHours: editTask?.estimatedHours || 2,
    category: editTask?.category || "Work",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Mission title required");
      return;
    }
    setSaving(true);
    await onSave({
      ...form,
      estimatedHours: Number(form.estimatedHours),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="guardian-panel w-full max-w-lg animate-fade-in-up"
        style={{
          border: "1px solid #F59E0B",
          boxShadow: "0 0 40px rgba(245,158,11,0.15)",
        }}
      >
        {/* Header */}
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <Target size={14} color="#F59E0B" />
            <span className="panel-title">
              {editTask ? "MODIFY MISSION" : "NEW MISSION ENTRY"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="guardian-label">Mission Title *</label>
            <input
              className="guardian-input"
              placeholder="e.g. Submit project report"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="guardian-label">Description</label>
            <textarea
              className="guardian-input resize-none"
              rows={2}
              placeholder="Additional details..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          {/* Deadline + Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="guardian-label">
                <Clock
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Deadline
              </label>
              <input
                type="datetime-local"
                className="guardian-input"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="guardian-label">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                className="guardian-input"
                value={form.estimatedHours}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estimatedHours: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="guardian-label">
              <AlertTriangle
                size={10}
                style={{ display: "inline", marginRight: 4 }}
              />
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, priority: p.value }))
                  }
                  className="py-2 text-center mono-xs font-bold transition-all"
                  style={{
                    border: `1px solid ${
                      form.priority === p.value ? p.color : "#2A2A2A"
                    }`,
                    background:
                      form.priority === p.value
                        ? `${p.color}22`
                        : "transparent",
                    color:
                      form.priority === p.value ? p.color : "#6B7280",
                    borderRadius: "2px",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="guardian-label">Category</label>
            <select
              className="guardian-input"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              style={{ colorScheme: "dark" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-amber flex-1"
            >
              ABORT
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-amber flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="guardian-loader w-4 h-4 border-2" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Zap size={12} />
                  {editTask ? "UPDATE MISSION" : "DEPLOY MISSION"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
