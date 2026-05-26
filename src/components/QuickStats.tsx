import React, { useState } from "react";
import { UserStats, Task, ThemeColor, ThemeBg } from "../types";
import { MOTIVATIONAL_CARDS } from "../utils";
import { CheckCircle2, Clock, ThumbsUp, RefreshCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickStatsProps {
  stats: UserStats;
  todayTasks: Task[];
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

const THEME_MAP = {
  violet: {
    bg: "bg-violet-400",
    textAccent: "text-violet-400",
    borderAccent: "border-violet-500/20",
    iconBg: "bg-violet-500/10"
  },
  emerald: {
    bg: "bg-emerald-400",
    textAccent: "text-emerald-400",
    borderAccent: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10"
  },
  amber: {
    bg: "bg-amber-400",
    textAccent: "text-amber-400",
    borderAccent: "border-amber-500/20",
    iconBg: "bg-amber-500/10"
  },
  rose: {
    bg: "bg-rose-400",
    textAccent: "text-rose-400",
    borderAccent: "border-rose-500/20",
    iconBg: "bg-rose-500/10"
  },
  sky: {
    bg: "bg-sky-400",
    textAccent: "text-sky-400",
    borderAccent: "border-sky-500/20",
    iconBg: "bg-sky-500/10"
  },
  pink: {
    bg: "bg-pink-400",
    textAccent: "text-pink-400",
    borderAccent: "border-pink-500/20",
    iconBg: "bg-pink-500/10"
  },
  white: {
    bg: "bg-slate-450",
    textAccent: "text-slate-550",
    borderAccent: "border-slate-300",
    iconBg: "bg-slate-100"
  },
  black: {
    bg: "bg-neutral-800",
    textAccent: "text-neutral-400",
    borderAccent: "border-neutral-800",
    iconBg: "bg-black/35"
  },
  yellow: {
    bg: "bg-yellow-400",
    textAccent: "text-yellow-600",
    borderAccent: "border-yellow-500/20",
    iconBg: "bg-yellow-500/10"
  }
};

export default function QuickStats({ stats, todayTasks, themeColor = "violet", themeBg = "blue" }: QuickStatsProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const currentQuote = MOTIVATIONAL_CARDS[currentQuoteIndex];
  const activeTheme = THEME_MAP[themeColor] || THEME_MAP.violet;

  const rotateQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_CARDS.length);
  };

  const cardClass = themeBg === "white"
    ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
    : themeBg === "black"
      ? "bg-zinc-900/50 border border-zinc-800 text-zinc-100"
      : "bg-slate-800/65 backdrop-blur-md border border-slate-700/50 text-[#F8FAFC]";

  const quoteClass = themeBg === "white"
    ? "bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-205 shadow-sm text-slate-800"
    : themeBg === "black"
      ? "bg-gradient-to-br from-zinc-900/70 to-zinc-950/40 border border-zinc-800 text-zinc-100"
      : "bg-gradient-to-br from-slate-800/80 to-indigo-950/40 backdrop-blur-md border border-indigo-500/20 text-slate-100";

  const headerTextClass = themeBg === "white" ? "text-slate-850" : "text-slate-100";
  const subtextClass = themeBg === "white" ? "text-slate-500 font-medium" : "text-slate-400";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="stats-bento-grid">
      {/* 1. Daily Progress Bento Card */}
      <div className={`col-span-1 ${cardClass} rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300`} id="today-progress-card">
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-xs font-semibold tracking-wider uppercase font-mono ${activeTheme.textAccent}`}>Progreso Diario</span>
            <h3 className={`text-2xl font-black mt-1 ${headerTextClass}`}>
              {completedToday}/{totalToday}
            </h3>
            <p className={`text-xs mt-0.5 ${subtextClass}`}>Tareas completadas hoy</p>
          </div>
          <div className={`p-2.5 rounded-xl border ${activeTheme.iconBg} ${activeTheme.borderAccent} ${activeTheme.textAccent}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Mini progress representation */}
        <div className="mt-4">
          <div className={`flex justify-between text-[11px] font-mono mb-1 ${subtextClass}`}>
            <span>Completitud</span>
            <span>{completionRate}%</span>
          </div>
          <div className={`w-full ${themeBg === "white" ? "bg-slate-200" : "bg-slate-700/35"} h-2 rounded-full overflow-hidden`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeTheme.bg}`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Focus Time Bento Card */}
      <div className={`col-span-1 ${cardClass} rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300`} id="focus-time-card">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase font-mono text-sky-400">Batería de Enfoque</span>
            <h3 className={`text-2xl font-black mt-1 ${headerTextClass}`}>
              {stats.totalFocusMinutes} <span className={`text-sm font-normal ${subtextClass}`}>min</span>
            </h3>
            <p className={`text-xs mt-0.5 ${subtextClass}`}>En {stats.totalFocusSessions} sesiones totales</p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-450">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Motivational subtext */}
        <div className={`mt-3 text-[11px] text-sky-450 ${themeBg === "white" ? "bg-sky-50 border border-sky-100" : "bg-sky-500/5 border border-sky-500/10"} p-2 rounded-xl flex items-center gap-2`}>
          <Trophy className="w-4 h-4 shrink-0" />
          <span>¡Cada minuto concentrado entrena tu poder mental!</span>
        </div>
      </div>

      {/* 3. Motivational quote visualizer */}
      <div className={`col-span-1 md:col-span-1 ${quoteClass} rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300`} id="focus-compassion-card">
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs font-semibold tracking-wider uppercase font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/25">
            💡 {currentQuote.theme}
          </span>
          <button
            onClick={rotateQuote}
            className={`text-slate-400 hover:text-indigo-400 transition-colors ${themeBg === "white" ? "transparent hover:bg-slate-200" : "bg-slate-705/30"} p-1.5 rounded-lg border border-slate-700/45 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            title="Siguiente recordatorio amable"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-full flex items-center my-3 min-h-[50px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className={`text-xs sm:text-sm ${themeBg === "white" ? "text-slate-700" : "text-slate-200"} font-medium leading-relaxed italic`}
            >
              "{currentQuote.quote}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="text-[10px] text-indigo-400 flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          <span>Toma aire. Un paso a la vez bastará.</span>
        </div>
      </div>
    </div>
  );
}
