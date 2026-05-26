import React, { useState } from "react";
import { Plus, Tag, Flag, Calendar, AlertCircle } from "lucide-react";
import { Category, Priority, ThemeColor, ThemeBg } from "../types";
import { CATEGORY_STYLES, PRIORITY_STYLES } from "../utils";

interface TaskFormProps {
  onAddTask: (title: string, category: Category, priority: Priority, deadline?: string) => void;
  themeColor?: ThemeColor;
}

const THEME_MAP = {
  violet: {
    bg: "bg-violet-600",
    hover: "hover:bg-violet-500",
    border: "border-violet-500",
    textLight: "text-violet-300",
    focusBorder: "focus:border-violet-500",
    focusRing: "focus:ring-violet-500",
    bgPill: "bg-violet-600/20",
    dot: "bg-violet-500 shadow-violet-500/55",
    shadow: "shadow-violet-950/20"
  },
  emerald: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-500",
    border: "border-emerald-500",
    textLight: "text-emerald-300",
    focusBorder: "focus:border-emerald-500",
    focusRing: "focus:ring-emerald-500",
    bgPill: "bg-emerald-600/20",
    dot: "bg-emerald-500 shadow-emerald-500/55",
    shadow: "shadow-emerald-950/20"
  },
  amber: {
    bg: "bg-amber-600",
    hover: "hover:bg-amber-500",
    border: "border-amber-500",
    textLight: "text-amber-300",
    focusBorder: "focus:border-amber-500",
    focusRing: "focus:ring-amber-500",
    bgPill: "bg-amber-600/20",
    dot: "bg-amber-500 shadow-amber-500/55",
    shadow: "shadow-amber-950/20"
  },
  rose: {
    bg: "bg-rose-600",
    hover: "hover:bg-rose-500",
    border: "border-rose-500",
    textLight: "text-rose-300",
    focusBorder: "focus:border-rose-500",
    focusRing: "focus:ring-rose-500",
    bgPill: "bg-rose-600/20",
    dot: "bg-rose-500 shadow-rose-500/55",
    shadow: "shadow-rose-950/20"
  },
  sky: {
    bg: "bg-sky-600",
    hover: "hover:bg-sky-500",
    border: "border-sky-500",
    textLight: "text-sky-300",
    focusBorder: "focus:border-sky-500",
    focusRing: "focus:ring-sky-500",
    bgPill: "bg-sky-600/20",
    dot: "bg-sky-500 shadow-sky-500/55",
    shadow: "shadow-sky-950/20"
  },
  pink: {
    bg: "bg-pink-600",
    hover: "hover:bg-pink-500",
    border: "border-pink-500",
    textLight: "text-pink-300",
    focusBorder: "focus:border-pink-500",
    focusRing: "focus:ring-pink-500",
    bgPill: "bg-pink-600/20",
    dot: "bg-pink-500 shadow-pink-500/55",
    shadow: "shadow-pink-950/20"
  },
  white: {
    bg: "bg-slate-500",
    hover: "hover:bg-slate-600",
    border: "border-slate-350",
    textLight: "text-slate-705",
    focusBorder: "focus:border-slate-400",
    focusRing: "focus:ring-slate-400",
    bgPill: "bg-slate-150",
    dot: "bg-slate-500 shadow-slate-400/55",
    shadow: "shadow-slate-350/20"
  },
  black: {
    bg: "bg-zinc-800",
    hover: "hover:bg-zinc-700",
    border: "border-zinc-700",
    textLight: "text-zinc-300",
    focusBorder: "focus:border-zinc-600",
    focusRing: "focus:ring-zinc-650",
    bgPill: "bg-black/35",
    dot: "bg-zinc-600 shadow-neutral-900/55",
    shadow: "shadow-black/20"
  },
  yellow: {
    bg: "bg-yellow-500",
    hover: "hover:bg-yellow-450",
    border: "border-yellow-400",
    textLight: "text-yellow-700",
    focusBorder: "focus:border-yellow-405",
    focusRing: "focus:ring-yellow-400",
    bgPill: "bg-yellow-600/20",
    dot: "bg-yellow-500 shadow-yellow-500/55",
    shadow: "shadow-yellow-950/20"
  }
};

interface TaskFormProps {
  onAddTask: (title: string, category: Category, priority: Priority, deadline?: string) => void;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

export default function TaskForm({ onAddTask, themeColor = "violet", themeBg = "blue" }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [priority, setPriority] = useState<Priority>("Media");
  const [deadline, setDeadline] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const activeTheme = THEME_MAP[themeColor] || THEME_MAP.violet;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Por favor, ingresa el título de la tarea.");
      return;
    }

    onAddTask(title.trim(), category, priority, deadline || undefined);
    
    // Clear form
    setTitle("");
    setDeadline("");
  };

  const cardClass = themeBg === "white"
    ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
    : themeBg === "black"
      ? "bg-zinc-900/50 border border-zinc-800 text-zinc-100"
      : "bg-slate-800/65 backdrop-blur-md border border-slate-700/50 text-[#F8FAFC]";

  const inputClass = themeBg === "white"
    ? "bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white"
    : "bg-slate-900 border border-slate-700/65 text-slate-200 placeholder-slate-500";

  const pickerClass = themeBg === "white"
    ? "bg-slate-100 border border-slate-200 text-slate-700"
    : "bg-slate-900 border border-slate-700 text-slate-200";

  const btnUnselectedClass = themeBg === "white"
    ? "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
    : "bg-slate-905 border-slate-700/60 text-slate-400 hover:bg-slate-900/80";

  const labelTextClass = themeBg === "white" ? "text-slate-800 font-semibold" : "text-slate-100";

  return (
    <div className={`${cardClass} rounded-2xl p-5 shadow-lg w-full transition-all duration-300`} id="task-creation-card">
      <h3 className={`text-sm font-bold ${labelTextClass} mb-4 tracking-tight flex items-center gap-2`}>
        <span className={`flex w-2.5 h-2.5 rounded-full ${activeTheme.dot} shadow-lg`} />
        Registrar un Objetivo Nuevo
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <div className="relative">
          <input
            type="text"
            id="new-task-title-input"
            placeholder="¿Qué te gustaría avanzar hoy? Manténlo simple y concreto..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            className={`w-full ${inputClass} rounded-xl py-3 px-4 text-sm focus:outline-none transition-all ${activeTheme.focusBorder} focus:ring-1 ${activeTheme.focusRing}`}
          />
          {errorMsg && (
            <div className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Priority & Category selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5">
              Categoría
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={`w-full ${pickerClass} rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 ${activeTheme.focusRing} transition-all cursor-pointer`}
              >
                <option value="Estudios">📚 Estudios</option>
                <option value="Trabajo">💼 Trabajo</option>
                <option value="Personal">✨ Personal</option>
                <option value="Hogar">🏠 Hogar</option>
                <option value="Salud">❤️ Salud</option>
                <option value="Ocio">🎮 Ocio</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5">
              Prioridad
            </label>
            <div className="flex gap-2">
              {(["Alta", "Media", "Baja"] as Priority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-[11px] font-semibold py-2 px-1 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${activeTheme.bgPill} ${activeTheme.border} ${activeTheme.textLight} shadow-inner`
                        : btnUnselectedClass
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deadline Calendar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha Límite (Opcional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`w-full ${pickerClass} rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 ${activeTheme.focusRing} transition-all`}
            />
          </div>

          {/* Submit big beautiful button */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all border border-black/10 cursor-pointer ${activeTheme.bg} ${activeTheme.hover} ${activeTheme.shadow}`}
            id="add-task-submit-button"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Agregar Tarea</span>
          </button>
        </div>
      </form>
    </div>
  );
}
