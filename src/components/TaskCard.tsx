import React, { useState } from "react";
import { Task, SubTask, Category, Priority, ThemeColor, ThemeBg } from "../types";
import { CATEGORY_STYLES, PRIORITY_STYLES } from "../utils";
import { 
  Check, Square, Play, Sparkles, Trash2, Edit2, ChevronDown, ChevronUp, Plus, X, ListTodo, ThumbsUp, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (id: string, updatedFields: Partial<Task>) => void;
  onFocusTask: (id: string) => void;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

const THEME_MAP = {
  violet: {
    bg: "bg-violet-600",
    border: "border-violet-500",
    bgPill: "bg-violet-600/10",
    borderPill: "border-violet-500/20",
    textPill: "text-violet-300",
    textAccent: "text-violet-400",
    focusBorder: "focus:border-violet-500",
    focusRing: "focus:ring-violet-500"
  },
  emerald: {
    bg: "bg-emerald-600",
    border: "border-emerald-500",
    bgPill: "bg-emerald-600/10",
    borderPill: "border-emerald-500/20",
    textPill: "text-emerald-300",
    textAccent: "text-emerald-400",
    focusBorder: "focus:border-emerald-500",
    focusRing: "focus:ring-emerald-500"
  },
  amber: {
    bg: "bg-amber-600",
    border: "border-amber-500",
    bgPill: "bg-amber-600/10",
    borderPill: "border-amber-500/20",
    textPill: "text-amber-300",
    textAccent: "text-amber-400",
    focusBorder: "focus:border-amber-500",
    focusRing: "focus:ring-amber-500"
  },
  rose: {
    bg: "bg-rose-600",
    border: "border-rose-500",
    bgPill: "bg-rose-600/10",
    borderPill: "border-rose-500/25",
    textPill: "text-rose-300",
    textAccent: "text-rose-400",
    focusBorder: "focus:border-rose-500",
    focusRing: "focus:ring-rose-500"
  },
  sky: {
    bg: "bg-sky-600",
    border: "border-sky-500",
    bgPill: "bg-sky-600/10",
    borderPill: "border-sky-500/20",
    textPill: "text-sky-300",
    textAccent: "text-sky-400",
    focusBorder: "focus:border-sky-500",
    focusRing: "focus:ring-sky-500"
  },
  pink: {
    bg: "bg-pink-600",
    border: "border-pink-500",
    bgPill: "bg-pink-600/10",
    borderPill: "border-pink-500/20",
    textPill: "text-pink-300",
    textAccent: "text-pink-400",
    focusBorder: "focus:border-pink-500",
    focusRing: "focus:ring-pink-500"
  },
  white: {
    bg: "bg-slate-400",
    border: "border-slate-350",
    bgPill: "bg-slate-200",
    borderPill: "border-slate-300",
    textPill: "text-slate-600",
    textAccent: "text-slate-500",
    focusBorder: "focus:border-slate-400",
    focusRing: "focus:ring-slate-400"
  },
  black: {
    bg: "bg-zinc-800",
    border: "border-zinc-705",
    bgPill: "bg-zinc-900",
    borderPill: "border-zinc-800",
    textPill: "text-zinc-400",
    textAccent: "text-zinc-400",
    focusBorder: "focus:border-zinc-600",
    focusRing: "focus:ring-zinc-650"
  },
  yellow: {
    bg: "bg-yellow-500",
    border: "border-yellow-400",
    bgPill: "bg-yellow-500/10",
    borderPill: "border-yellow-500/20",
    textPill: "text-yellow-700",
    textAccent: "text-yellow-600",
    focusBorder: "focus:border-yellow-400",
    focusRing: "focus:ring-yellow-400"
  }
};

export default function TaskCard({ task, onToggleComplete, onDelete, onUpdateTask, onFocusTask, themeColor = "violet", themeBg = "blue" }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isSplitting, setIsSplitting] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [apiError, setApiError] = useState("");

  const activeTheme = THEME_MAP[themeColor] || THEME_MAP.violet;

  const catStyle = CATEGORY_STYLES[task.category];
  const prioStyle = PRIORITY_STYLES[task.priority];

  // Calculate subtasks progress
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtasksPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdateTask(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  // Split task intelligently using server-side Gemini proxy endpoint
  const handleSplitTask = async () => {
    setIsSplitting(true);
    setApiError("");
    setIsExpanded(true); // make sure subtask area is unfolded to see results

    try {
      const response = await fetch("/api/gemini/split-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, category: task.category }),
      });

      if (!response.ok) {
        throw new Error("La solicitud al servidor falló.");
      }

      const data = await response.json();
      if (data.steps && Array.isArray(data.steps)) {
        const generatedSubtasks: SubTask[] = data.steps.map((stepText: string, idx: number) => ({
          id: `${task.id}-step-${idx}-${Date.now()}`,
          title: stepText,
          completed: false,
        }));

        onUpdateTask(task.id, { 
          subtasks: [...task.subtasks, ...generatedSubtasks],
          motivation: data.motivation || "¡Empecemos poco a poco!"
        });
      } else if (data.error) {
        setApiError(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Hubo un error de conexión al servidor de IA.");
    } finally {
      setIsSplitting(false);
    }
  };

  // Add subtask manual step
  const handleAddManualStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const newStep: SubTask = {
      id: `manual-step-${Date.now()}-${Math.random()}`,
      title: newStepTitle.trim(),
      completed: false,
    };

    onUpdateTask(task.id, {
      subtasks: [...task.subtasks, newStep]
    });
    setNewStepTitle("");
  };

  // Toggle subtask step check status
  const handleToggleStep = (stepId: string) => {
    const updated = task.subtasks.map((step) => {
      if (step.id === stepId) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });
    onUpdateTask(task.id, { subtasks: updated });
  };

  // Delete individual step
  const handleDeleteStep = (stepId: string) => {
    const filtered = task.subtasks.filter((step) => step.id !== stepId);
    onUpdateTask(task.id, { subtasks: filtered });
  };

  const cardClass = themeBg === "white"
    ? `group bg-slate-50 hover:bg-white border rounded-2xl p-4 transition-all duration-300 relative ${
        task.completed
          ? "border-slate-200 opacity-60"
          : "border-slate-200 hover:border-slate-300 shadow-sm"
      }`
    : themeBg === "black"
      ? `group bg-zinc-950/40 border rounded-2xl p-4 transition-all duration-305 relative ${
          task.completed
            ? "border-zinc-900/70 opacity-60"
            : "border-zinc-850 hover:border-zinc-700 text-zinc-100 shadow-md"
        }`
      : `group bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border transition-all duration-300 relative ${
          task.completed
            ? "border-slate-800/40 opacity-70"
            : "border-slate-700/50 hover:border-slate-600 shadow-md hover:shadow-xl"
        }`;

  const headerTextClass = task.completed
    ? "line-through text-slate-400"
    : themeBg === "white"
      ? "text-slate-900 font-bold"
      : "text-slate-100 font-bold";

  const inputClass = themeBg === "white"
    ? "bg-white border border-slate-250 text-slate-800"
    : "bg-slate-900 border border-slate-700 text-slate-205";

  const badgeDeadlineClass = themeBg === "white"
    ? "bg-slate-100 border border-slate-205 text-slate-600"
    : "bg-slate-900/30 border border-slate-700/40 text-slate-400";

  const btnSecondaryClass = themeBg === "white"
    ? "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
    : "bg-slate-700/30 text-slate-400 hover:text-slate-200 border border-slate-700/45";

  const subtaskMainProgressClass = themeBg === "white"
    ? "bg-slate-200 border border-slate-250"
    : "bg-slate-900/30 border border-slate-700/20";

  const themeBorderCheckboxClass = themeBg === "white"
    ? "border-slate-300 hover:border-slate-400"
    : "border-slate-600 hover:border-slate-500";

  return (
    <div
      className={cardClass}
      id={`task-card-${task.id}`}
    >
      <div className="flex items-start gap-3 justify-between">
        {/* Step Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all border ${
            task.completed
              ? `${activeTheme.bg} ${activeTheme.border} text-white shadow-lg`
              : `${themeBorderCheckboxClass} text-transparent`
          }`}
          id={`complete-task-${task.id}`}
          title={task.completed ? "Reabrir tarea" : "Completar tarea"}
        >
          <Check className="w-4 h-4 text-white font-black stroke-[3]" />
        </button>

        {/* Task Core Title and Actions */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 items-center w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsEditing(false);
                  } else if (e.key === "Enter") {
                    handleSaveEdit();
                  }
                }}
                className={`flex-1 ${inputClass} rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:ring-1 ${activeTheme.focusBorder} ${activeTheme.focusRing}`}
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all focus:ring-1 focus:ring-emerald-500"
              >
                Listo
              </button>
            </div>
          ) : (
            <div>
              <h4
                className={`text-sm sm:text-base ${headerTextClass} truncate`}
              >
                {task.title}
              </h4>
            </div>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${prioStyle.text} ${prioStyle.bg} ${prioStyle.border}`}>
              {prioStyle.label}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}>
              {catStyle.label}
            </span>
            {task.deadline && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${badgeDeadlineClass}`}>
                📅 Vence: {task.deadline}
              </span>
            )}
          </div>
        </div>

        {/* Secondary controls (always interactive, but styled modernly) */}
        <div className="flex items-center gap-1">
          {/* Quick Bind Focus Timer */}
          {!task.completed && (
            <button
              onClick={() => onFocusTask(task.id)}
              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20 transition-all focus:outline-none"
              title="Enfocarse en esta tarea en el temporizador"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Edit Inline Toggle */}
          <button
            onClick={() => {
              setEditTitle(task.title);
              setIsEditing(!isEditing);
            }}
            className={`p-1.5 rounded-lg ${btnSecondaryClass} transition-all`}
            title="Editar nombre"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task */}
          <button
            onClick={() => onDelete(task.id)}
            className={`p-1.5 rounded-lg ${btnSecondaryClass} hover:text-rose-500 transition-all`}
            title="Eliminar tarea definitivamente"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks Progress Line */}
      {totalSubtasks > 0 && (
        <div className="mt-3.5">
          <div className={`flex justify-between text-[11px] ${themeBg === "white" ? "text-slate-550" : "text-slate-400"} mb-1 font-mono`}>
            <span>Pasos desglosados</span>
            <span>{completedSubtasks}/{totalSubtasks} ({subtasksPercent}%)</span>
          </div>
          <div className={`w-full ${subtaskMainProgressClass} h-1.5 rounded-full overflow-hidden p-[1px]`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${activeTheme.bg}`}
              style={{ width: `${subtasksPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Mindful motivation quote callback from server */}
      {task.motivation && !task.completed && (
        <div className={`mt-3 p-2.5 rounded-xl text-left text-xs flex items-start gap-1.5 ${themeBg === "white" ? "bg-slate-100 border border-slate-200 text-slate-700" : `${activeTheme.bgPill} ${activeTheme.borderPill} ${activeTheme.textPill}`}`}>
          <ThumbsUp className={`w-4 h-4 shrink-0 mt-0.5 animate-bounce ${activeTheme.textAccent}`} />
          <p className="italic leading-relaxed">
            "{task.motivation}"
          </p>
        </div>
      )}

      {/* Accordion trigger footer */}
      <div className={`mt-3 flex gap-2 justify-between items-center ${themeBg === "white" ? "bg-slate-100/50" : "bg-slate-900/10"} -mx-4 -mb-4 px-4 py-2 rounded-b-2xl border-t ${themeBg === "white" ? "border-slate-150" : "border-slate-700/20"}`}>
        {!task.completed && totalSubtasks === 0 ? (
          /* Gemini division activator button */
          <button
            onClick={handleSplitTask}
            disabled={isSplitting}
            className="relative overflow-hidden text-xs text-purple-400 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-slate-500/5 px-3.5 py-1.5 rounded-xl border border-purple-500/20 hover:border-purple-500/50 active:scale-[0.98] hover:text-purple-600 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Usa el psicólogo inteligente de FocusFlow para dividir esta tarea en pasos viables"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-450 animate-spin-slow" />
            <span>{isSplitting ? "Procesando pasos..." : "Dividir tarea con IA ✨"}</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs ${themeBg === "white" ? "text-slate-550 hover:bg-slate-200/50 hover:text-slate-800" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/10"} flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Pasos ({totalSubtasks})</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded subtask block area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-4 pt-1"
          >
            {/* Split task loading states */}
            {isSplitting && (
              <div className={`py-4 space-y-2 border-t ${themeBg === "white" ? "border-slate-200" : "border-slate-700/30"}`}>
                <p className="text-xs text-indigo-500 flex items-center gap-2 animate-pulse font-mono">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  Reduciendo carga cognitiva con Inteligencia Artificial...
                </p>
                <div className="space-y-1.5">
                  <div className={`h-4 ${themeBg === "white" ? "bg-slate-100" : "bg-slate-900/40"} rounded animate-pulse w-5/6`} />
                  <div className={`h-4 ${themeBg === "white" ? "bg-slate-100" : "bg-slate-900/40"} rounded animate-pulse w-3/4`} />
                  <div className={`h-4 ${themeBg === "white" ? "bg-slate-100" : "bg-slate-900/40"} rounded animate-pulse w-2/3`} />
                </div>
              </div>
            )}

            {apiError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-xs text-rose-600 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{apiError}</span>
              </div>
            )}

            {/* List of subtasks */}
            <div className={`border-t ${themeBg === "white" ? "border-slate-150" : "border-slate-700/30"} pt-3 space-y-2`}>
              {task.subtasks.map((step) => (
                <div
                  key={step.id}
                  className={`group/step flex items-center justify-between gap-2.5 text-xs ${themeBg === "white" ? "bg-slate-100/50 hover:bg-slate-100 text-slate-800 border border-slate-150" : "bg-slate-900/20 hover:bg-slate-900/45 text-slate-300 border border-slate-700/10"} px-3 py-2 rounded-xl transition-all`}
                >
                  <button
                    onClick={() => handleToggleStep(step.id)}
                    className="flex-1 text-left flex items-start gap-2.5 min-w-0"
                  >
                    <div
                      className={`shrink-0 mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center border ${
                        step.completed
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-500"
                          : themeBg === "white" ? "border-slate-300 group-hover/step:border-slate-400 text-transparent" : "border-slate-700 group-hover/step:border-slate-500 text-transparent"
                      }`}
                    >
                      {step.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`truncate leading-tight ${step.completed ? "line-through text-slate-400" : themeBg === "white" ? "text-slate-700" : "text-slate-300"}`}>
                      {step.title}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-slate-500 hover:text-rose-500 scale-0 group-hover/step:scale-100 transition-all p-0.5 focus:outline-none"
                    title="Eliminar paso de acción"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add manual step builder */}
              <form onSubmit={handleAddManualStep} className="flex gap-2 pt-1.5">
                <input
                  type="text"
                  placeholder="Añadir paso personal..."
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className={`flex-1 ${inputClass} rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 ${activeTheme.focusRing}`}
                />
                <button
                  type="submit"
                  disabled={!newStepTitle.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
