import React from "react";
import { Award, Zap, Flame, Sparkles } from "lucide-react";
import { UserStats, ThemeColor, ThemeBg } from "../types";
import { getLevelProgress } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface XPStatusProps {
  stats: UserStats;
  pointsBubble: { id: number; amount: number; text: string } | null;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

const THEME_MAP = {
  violet: {
    bg: "bg-violet-500",
    textAccent: "text-violet-400",
    textLight: "text-violet-300",
    borderAccent: "border-violet-500/40",
    pillBg: "bg-violet-500/20",
    pillBorder: "border-violet-500/25",
    iconBg: "bg-violet-600/20",
    bubbleGradient: "from-violet-500 to-amber-500",
    progressGradient: "from-violet-500 via-purple-500 to-sky-450"
  },
  emerald: {
    bg: "bg-emerald-500",
    textAccent: "text-emerald-400",
    textLight: "text-emerald-300",
    borderAccent: "border-emerald-500/40",
    pillBg: "bg-emerald-500/20",
    pillBorder: "border-emerald-500/25",
    iconBg: "bg-emerald-600/20",
    bubbleGradient: "from-emerald-500 to-teal-500",
    progressGradient: "from-emerald-500 via-teal-500 to-sky-400"
  },
  amber: {
    bg: "bg-amber-500",
    textAccent: "text-amber-400",
    textLight: "text-amber-300",
    borderAccent: "border-amber-500/40",
    pillBg: "bg-amber-500/20",
    pillBorder: "border-amber-500/25",
    iconBg: "bg-amber-600/20",
    bubbleGradient: "from-amber-500 to-orange-500",
    progressGradient: "from-amber-500 via-orange-400 to-yellow-350"
  },
  rose: {
    bg: "bg-rose-500",
    textAccent: "text-rose-400",
    textLight: "text-rose-300",
    borderAccent: "border-rose-500/40",
    pillBg: "bg-rose-500/20",
    pillBorder: "border-rose-500/25",
    iconBg: "bg-rose-600/20",
    bubbleGradient: "from-rose-500 to-amber-500",
    progressGradient: "from-rose-500 via-pink-500 to-purple-400"
  },
  sky: {
    bg: "bg-sky-500",
    textAccent: "text-sky-400",
    textLight: "text-sky-300",
    borderAccent: "border-sky-500/40",
    pillBg: "bg-sky-500/20",
    pillBorder: "border-sky-500/25",
    iconBg: "bg-sky-600/20",
    bubbleGradient: "from-sky-500 to-indigo-500",
    progressGradient: "from-sky-500 via-blue-500 to-emerald-400"
  },
  pink: {
    bg: "bg-pink-500",
    textAccent: "text-pink-400",
    textLight: "text-pink-300",
    borderAccent: "border-pink-500/40",
    pillBg: "bg-pink-500/20",
    pillBorder: "border-pink-500/25",
    iconBg: "bg-pink-600/20",
    bubbleGradient: "from-pink-500 to-amber-500",
    progressGradient: "from-pink-500 via-pink-400 to-rose-400"
  },
  white: {
    bg: "bg-slate-400",
    textAccent: "text-slate-400",
    textLight: "text-slate-500",
    borderAccent: "border-slate-300/40",
    pillBg: "bg-slate-100",
    pillBorder: "border-slate-200",
    iconBg: "bg-slate-200",
    bubbleGradient: "from-slate-400 to-slate-500",
    progressGradient: "from-slate-400 via-slate-350 to-slate-500"
  },
  black: {
    bg: "bg-neutral-800",
    textAccent: "text-neutral-400",
    textLight: "text-neutral-300",
    borderAccent: "border-neutral-800/45",
    pillBg: "bg-black/30",
    pillBorder: "border-neutral-800",
    iconBg: "bg-black/35",
    bubbleGradient: "from-neutral-700 to-neutral-850",
    progressGradient: "from-neutral-800 via-neutral-700 to-neutral-400"
  },
  yellow: {
    bg: "bg-yellow-500",
    textAccent: "text-yellow-500",
    textLight: "text-yellow-600",
    borderAccent: "border-yellow-550/35",
    pillBg: "bg-yellow-500/10",
    pillBorder: "border-yellow-500/20",
    iconBg: "bg-yellow-600/20",
    bubbleGradient: "from-yellow-400 to-orange-400",
    progressGradient: "from-yellow-500 via-amber-400 to-orange-400"
  }
};

export default function XPStatus({ stats, pointsBubble, themeColor = "violet", themeBg = "blue" }: XPStatusProps) {
  const { percent, currentXP, maxXP } = getLevelProgress(stats.xp);
  const activeTheme = THEME_MAP[themeColor];

  const cardClass = themeBg === "white" 
    ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
    : themeBg === "black"
      ? "bg-zinc-900/50 border border-zinc-800 text-zinc-100"
      : "bg-slate-800/65 backdrop-blur-md border border-slate-700/50 text-[#F8FAFC]";

  return (
    <div className={`relative ${cardClass} rounded-2xl p-4 sm:p-5 shadow-lg w-full transition-all duration-300`} id="xp-status-section">
      {/* XP Floating indicator */}
      <AnimatePresence>
        {pointsBubble && (
          <motion.div
            key={pointsBubble.id}
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -45, scale: 1.1 }}
            exit={{ opacity: 0, y: -80, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute right-6 top-0 bg-gradient-to-r ${activeTheme.bubbleGradient} text-white font-bold py-1.5 px-3.5 rounded-full shadow-lg text-sm flex items-center gap-1.5 z-50 border border-white/20`}
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>+{pointsBubble.amount} XP</span>
            <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded text-white/90">
              {pointsBubble.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left: User Stats (Level & Streaks) */}
        <div className="flex items-center gap-3.5">
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${activeTheme.iconBg} border ${activeTheme.borderAccent} ${activeTheme.textAccent}`}>
            <Award className="w-7 h-7" id="user-level-badge" />
            <span className={`absolute -bottom-1 -right-1 ${activeTheme.bg} text-white text-[10px] font-bold px-1.5 rounded-full border border-slate-800`}>
              Niv. {stats.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className={`text-base font-bold ${themeBg === "white" ? "text-slate-800" : "text-slate-100"} font-sans tracking-tight`}>Tu Progreso de Enfoque</h2>
              <span className={`text-xs font-mono ${activeTheme.pillBg} ${activeTheme.textLight} font-medium px-2 py-0.5 rounded-full border ${activeTheme.pillBorder}`}>
                Nivel {stats.level}
              </span>
            </div>
            <p className={`text-xs ${themeBg === "white" ? "text-slate-500" : "text-slate-400"} font-medium`}>
              Siguiente nivel en {maxXP - currentXP} XP
            </p>
          </div>
        </div>

        {/* Right: Streak & Completed counters */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-bounce" id="daily-streak-flame" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-mono text-amber-400 leading-none">Racha Diaria</p>
              <p className={`text-sm font-bold ${themeBg === "white" ? "text-slate-700" : "text-slate-200"}`}>{stats.streak} {stats.streak === 1 ? "Día" : "Días"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-xl">
            <Zap className="w-5 h-5 text-sky-400" id="total-focus-zap" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-mono text-sky-400 leading-none">Hitos Logrados</p>
              <p className={`text-sm font-bold ${themeBg === "white" ? "text-slate-700" : "text-slate-200"}`}>{stats.totalTasksCompleted} Tareas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className={`${themeBg === "white" ? "text-slate-500" : "text-slate-400"} font-medium font-mono`}>{currentXP} XP</span>
          <span className={`${themeBg === "white" ? "text-slate-500" : "text-slate-400"} font-medium font-mono`}>{maxXP} XP</span>
        </div>
        <div className={`w-full ${themeBg === "white" ? "bg-slate-200/70 border-slate-300" : "bg-slate-700/45 border-slate-700/25"} h-3 rounded-full overflow-hidden border p-[2px]`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className={`h-full bg-gradient-to-r ${activeTheme.progressGradient} rounded-full`}
            id="xp-progress-bar-fill"
          />
        </div>
      </div>
    </div>
  );
}
