import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Sparkles, BookOpen, Clock, Settings, HelpCircle, CheckSquare } from "lucide-react";
import { Task, ThemeColor, ThemeBg } from "../types";
import { motion } from "motion/react";

interface FocusModeProps {
  tasks: Task[];
  onCompleteSession: (minutes: number, xpResult: number, text: string) => void;
  selectedTaskIdFromParent?: string;
  onToggleComplete?: (id: string) => void;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

const THEME_MAP = {
  violet: {
    bg: "bg-violet-600",
    hover: "hover:bg-violet-500",
    textAccent: "text-violet-400",
    stroke: "stroke-violet-500",
    focusBorder: "focus:border-violet-500",
    focusRing: "focus:ring-violet-500",
    fromTo: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500",
    borderGlow: "border-violet-400/25",
    shadow: "shadow-purple-900/20"
  },
  emerald: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-500",
    textAccent: "text-emerald-400",
    stroke: "stroke-emerald-500",
    focusBorder: "focus:border-emerald-500",
    focusRing: "focus:ring-emerald-500",
    fromTo: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
    borderGlow: "border-emerald-400/25",
    shadow: "shadow-emerald-900/20"
  },
  amber: {
    bg: "bg-amber-600",
    hover: "hover:bg-amber-500",
    textAccent: "text-amber-400",
    stroke: "stroke-amber-500",
    focusBorder: "focus:border-amber-500",
    focusRing: "focus:ring-amber-500",
    fromTo: "from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500",
    borderGlow: "border-amber-400/25",
    shadow: "shadow-yellow-900/25"
  },
  rose: {
    bg: "bg-rose-600",
    hover: "hover:bg-rose-500",
    textAccent: "text-rose-400",
    stroke: "stroke-rose-500",
    focusBorder: "focus:border-rose-500",
    focusRing: "focus:ring-rose-500",
    fromTo: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500",
    borderGlow: "border-rose-400/25",
    shadow: "shadow-rose-900/20"
  },
  sky: {
    bg: "bg-sky-600",
    hover: "hover:bg-sky-500",
    textAccent: "text-sky-400",
    stroke: "stroke-sky-500",
    focusBorder: "focus:border-sky-500",
    focusRing: "focus:ring-sky-500",
    fromTo: "from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500",
    borderGlow: "border-sky-400/25",
    shadow: "shadow-indigo-900/20"
  }
};

export default function FocusMode({ tasks, onCompleteSession, selectedTaskIdFromParent, onToggleComplete, themeColor = "violet", themeBg = "blue" }: FocusModeProps) {
  const activeTheme = THEME_MAP[themeColor] || THEME_MAP.violet;
  const [timerType, setTimerType] = useState<"pomodoro" | "flowtime">("pomodoro");
  const [sessionState, setSessionState] = useState<"working" | "break" | "idle">("idle");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [pomodoroLength, setPomodoroLength] = useState(25); // minutes
  const [breakLength, setBreakLength] = useState(5); // minutes
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [ambientRunning, setAmbientRunning] = useState(false);

  // Web Audio Context & Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodeRef = useRef<BiquadFilterNode | null>(null);
  const playAmbientOscRef1 = useRef<OscillatorNode | null>(null);
  const playAmbientOscRef2 = useRef<OscillatorNode | null>(null);
  const tickBufferRef = useRef<number>(0);

  // Flowtime variables
  const [flowSeconds, setFlowSeconds] = useState(0);

  // Update selection if passed from parent (like clicking focus from task card)
  useEffect(() => {
    if (selectedTaskIdFromParent) {
      setSelectedTaskId(selectedTaskIdFromParent);
    }
  }, [selectedTaskIdFromParent]);

  // Handle countdown logic with robust delta timestamps to prevent tab sleep freeze
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      if (timerType === "pomodoro") {
        endTimeRef.current = Date.now() + timeLeft * 1000;
        timerRef.current = setInterval(() => {
          const remainingSecs = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
          setTimeLeft(remainingSecs);
          if (remainingSecs <= 0) {
            handleSessionEnd();
          }
        }, 200);
      } else {
        startTimeRef.current = Date.now() - flowSeconds * 1000;
        timerRef.current = setInterval(() => {
          const elapsedSecs = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
          setFlowSeconds(elapsedSecs);
        }, 200);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timerType, sessionState]);

  // Synchronize dynamic background audio loops when isSoundEnabled and isRunning change
  useEffect(() => {
    if (isRunning && isSoundEnabled) {
      startAmbientNoise();
    } else {
      stopAmbientNoise();
    }
    return () => stopAmbientNoise();
  }, [isRunning, isSoundEnabled]);

  // Synthesize a calming bell/chime using Web Audio API
  const playBellSound = (frequency: number = 587.33, duration: number = 1.8) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      // Nice bell chime harmonics
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not fully supported or blocked by user guest settings: ", e);
    }
  };

  // Synthesize a calming pink focus drone (oscillator nodes filtered gracefully)
  const startAmbientNoise = () => {
    try {
      if (ambientRunning) return;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, ctx.currentTime); // deeply muffled focusing drone

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 drone Note

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(165, ctx.currentTime); // E3 perfect fifth drone

      // Soft LFO modulation to represent serene sea waves
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 12 seconds per wave cycle
      lfoGain.gain.setValueAtTime(80, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime); // very low ambient intensity

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc1.start();
      osc2.start();

      playAmbientOscRef1.current = osc1;
      playAmbientOscRef2.current = osc2;
      setAmbientRunning(true);
    } catch (e) {
      console.warn("Ambient noise synthesis blocked or uninitialized: ", e);
    }
  };

  const stopAmbientNoise = () => {
    try {
      if (playAmbientOscRef1.current) {
        playAmbientOscRef1.current.stop();
        playAmbientOscRef1.current = null;
      }
      if (playAmbientOscRef2.current) {
        playAmbientOscRef2.current.stop();
        playAmbientOscRef2.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientRunning(false);
    } catch (e) {
      // already stopped
    }
  };

  const startSession = () => {
    if (sessionState === "idle") {
      setSessionState("working");
    }
    setIsRunning(true);
    if (isSoundEnabled) {
      playBellSound(523.25, 1.2); // Calm start chord C5
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resetSession = () => {
    setIsRunning(false);
    setSessionState("idle");
    setTimeLeft(pomodoroLength * 60);
    setFlowSeconds(0);
    stopAmbientNoise();
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    stopAmbientNoise();

    if (timerType === "pomodoro") {
      if (sessionState === "working") {
        if (isSoundEnabled) {
          playBellSound(880, 2.5); // A5 celebration bell
        }
        // Grant rewards
        const xpEarned = 25; // standard rewarding focus session
        onCompleteSession(
          pomodoroLength,
          xpEarned,
          `Sesión de Pomodoro completada (${pomodoroLength} min)`
        );
        // Switch to break state automatically
        setSessionState("break");
        setTimeLeft(breakLength * 60);
      } else {
        // Break finished
        if (isSoundEnabled) {
          playBellSound(587.33, 1.5);
        }
        setSessionState("idle");
        setTimeLeft(pomodoroLength * 60);
      }
    }
  };

  // Stop flowtime and convert session to points/rewards
  const finishFlowtime = () => {
    if (flowSeconds < 10) return; // ignore accident clicks
    setIsRunning(false);
    stopAmbientNoise();

    const minutes = Math.floor(flowSeconds / 60) || 1;
    const xpReward = Math.min(minutes * 2, 50) + 10; // rewarding active Flowtime mode: 10 base + 2 per min

    if (isSoundEnabled) {
      playBellSound(880, 2.5);
    }

    onCompleteSession(
      minutes,
      xpReward,
      `Sesión Flowtime completada (${minutes} min)`
    );

    // Dynamic restorative break suggested depending on worked duration (5m per 25 min)
    const suggestedBreak = Math.max(Math.round(minutes / 5), 2);
    setSessionState("break");
    setTimerType("pomodoro"); // convert break to standard countdown for easy flow
    setTimeLeft(suggestedBreak * 60);
    setFlowSeconds(0);
  };

  // Calculated properties
  const totalDuration = timerType === "pomodoro" 
    ? (sessionState === "break" ? breakLength * 60 : pomodoroLength * 60)
    : 0;

  const progressPercent = timerType === "pomodoro"
    ? ((totalDuration - timeLeft) / totalDuration) * 100
    : 100; // full or loading ring in flow mode

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getAssociatedTaskTitle = () => {
    const task = tasks.find((t) => t.id === selectedTaskId);
    return task ? task.title : "Enfoque general";
  };

  // SVGs Circle calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-slate-800/65 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col items-center relative overflow-hidden" id="focus-session-module">
      {/* Absolute Header options */}
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <button
            onClick={() => {
              if (sessionState === "idle") {
                setTimerType("pomodoro");
                setTimeLeft(pomodoroLength * 60);
              }
            }}
            disabled={sessionState !== "idle"}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              timerType === "pomodoro"
                ? `${activeTheme.bg} text-white shadow`
                : "text-slate-400 hover:text-slate-200 disabled:opacity-50"
            }`}
          >
            📋 Pomodoro
          </button>
          <button
            onClick={() => {
              if (sessionState === "idle") {
                setTimerType("flowtime");
                setFlowSeconds(0);
              }
            }}
            disabled={sessionState !== "idle"}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              timerType === "flowtime"
                ? `${activeTheme.bg} text-white shadow`
                : "text-slate-400 hover:text-slate-200 disabled:opacity-50"
            }`}
          >
            ⏳ Flowtime Libre
          </button>
        </div>

        {/* Audio Mute toggle */}
        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={`p-2 rounded-xl transition-all border ${
            isSoundEnabled
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/15"
              : "bg-slate-700/20 border-slate-700/40 text-slate-400 hover:bg-slate-700/35"
          }`}
          title={isSoundEnabled ? "Silenciar ambiente y campanas" : "Activar ambiente musical sintético"}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Focus Target Selector */}
      <div className="w-full max-w-xs mb-6 text-center">
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
          Enfocándote en:
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          disabled={sessionState !== "idle"}
          className={`w-full text-center bg-slate-900/65 border border-slate-700/50 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 ${activeTheme.focusRing} disabled:opacity-65 transition-all`}
        >
          <option value="">🎯 Enfoque General</option>
          {tasks
            .filter((t) => !t.completed)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title.length > 32 ? `${t.title.substring(0, 32)}...` : t.title}
              </option>
            ))}
        </select>
      </div>

      {/* Circle Clock visualization */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-52 h-52 -rotate-90">
          {/* Background circle track */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            className="stroke-slate-900 fill-none"
            strokeWidth="11"
          />
          {/* Dynamic timer circle */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            className={`fill-none transition-all duration-300 ${
              sessionState === "break" ? "stroke-sky-400" : activeTheme.stroke
            }`}
            strokeWidth="11"
            strokeDasharray={circumference}
            strokeDashoffset={timerType === "pomodoro" ? strokeDashoffset : 0}
            strokeLinecap="round"
          />
        </svg>

        {/* Absolute inner text */}
        <div className="absolute flex flex-col items-center">
          <BookOpen className={`w-5 h-5 mb-1 ${sessionState === "break" ? "text-sky-400" : `${activeTheme.textAccent} animate-pulse`}`} />
          
          <h2 className="text-3xl font-black font-mono text-slate-100 tracking-tight select-none">
            {timerType === "pomodoro" 
              ? formatTime(timeLeft)
              : formatTime(flowSeconds)}
          </h2>

          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-bold mt-1">
            {sessionState === "idle" && "Listo para Iniciar"}
            {sessionState === "working" && "¡Concéntrate!"}
            {sessionState === "break" && "Momento de Descanso"}
          </span>
        </div>
      </div>

      {/* Dynamic Sound status overlay */}
      {ambientRunning && isSoundEnabled && (
        <div className="flex items-center gap-1.5 mb-4 text-[10px] text-indigo-400 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Drone de Enfoque sintetizado sonando de fondo...</span>
        </div>
      )}

      {/* Session Controls */}
      <div className="flex gap-4 items-center justify-center">
        {/* Reset button */}
        {(sessionState !== "idle" || timerType === "flowtime" && flowSeconds > 0) && (
          <button
            onClick={resetSession}
            className="p-3 rounded-full bg-slate-700/40 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700/60 transition-all focus:outline-none"
            title="Reiniciar Sesión"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Big Start / pause trigger */}
        {!isRunning ? (
          <button
            onClick={startSession}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r ${activeTheme.fromTo} text-white font-bold shadow-xl ${activeTheme.shadow} text-sm border ${activeTheme.borderGlow} transition-all transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none`}
            id="start-focus-button"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {sessionState === "idle" ? "Iniciar Sesión" : "Reanudar"}
            </span>
          </button>
        ) : (
          <button
            onClick={pauseSession}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-200 hover:bg-white text-slate-900 font-bold shadow-xl text-sm transition-all transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none animate-pulse"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pausar</span>
          </button>
        )}

        {/* Flowtime STOP reward trigger */}
        {timerType === "flowtime" && sessionState === "working" && (
          <button
            onClick={finishFlowtime}
            disabled={flowSeconds < 10}
            className="flex items-center gap-1.5 px-4.5 py-3 rounded-full bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 font-bold transition-all text-xs disabled:opacity-50"
            title="Finalizar enfoque libre y reclamar XP"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Frenar y Cobrar XP</span>
          </button>
        )}
      </div>

      {/* Selected Task Details with Subtasks */}
      {selectedTaskId && (
        <div className="w-full mt-6 pt-5 border-t border-slate-700/35">
          <div className="flex flex-col gap-3">
            {(() => {
              const task = tasks.find(t => t.id === selectedTaskId);
              if (!task) return null;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200 truncate pr-2">{task.title}</span>
                    <button
                      onClick={() => {
                        if (onToggleComplete) {
                          onToggleComplete(task.id);
                          setSelectedTaskId(""); // clear it since it gets deleted
                        }
                      }}
                      className="group shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm font-bold border border-emerald-400/30"
                    >
                      <CheckSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
                      Completar <span className="text-emerald-100 font-mono text-xs bg-emerald-700/30 px-1.5 py-0.5 rounded-md mix-blend-color-dodge">+15 XP</span>
                    </button>
                  </div>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Subtareas de enfoque:</p>
                      <ul className="space-y-2">
                        {task.subtasks.map(subtask => (
                          <li key={subtask.id} className={`flex items-start gap-2 text-xs ${subtask.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                            <div className="mt-0.5">
                              {subtask.completed ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded border border-slate-600 shrink-0" />}
                            </div>
                            <span className="flex-1">{subtask.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pomodoro Settings section (accordion) */}
      {sessionState === "idle" && timerType === "pomodoro" && (
        <div className="w-full mt-6 pt-5 border-t border-slate-700/35">
          <div className="flex items-center gap-1.5 mb-3 text-slate-300 font-medium">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs">Configurar Tiempos</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Minutos Enfoque</label>
              <input
                type="number"
                min="5"
                max="120"
                value={pomodoroLength}
                onChange={(e) => {
                  const val = Math.max(5, Math.min(120, parseInt(e.target.value) || 25));
                  setPomodoroLength(val);
                  setTimeLeft(val * 60);
                }}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Minutos Descanso</label>
              <input
                type="number"
                min="2"
                max="60"
                value={breakLength}
                onChange={(e) => {
                  setBreakLength(Math.max(2, Math.min(60, parseInt(e.target.value) || 5)));
                }}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mindful Helpful Tip block */}
      <div className="mt-5 text-[11px] text-slate-400/85 text-center leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-700/10 flex items-start gap-1.5 justify-center w-full">
        <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${activeTheme.textAccent}`} />
        <p>
          {timerType === "pomodoro"
            ? "Pomodoro te da bloques definidos con descansos obligatorios. Excelente para arrancar."
            : "Flowtime no tiene presión de parada. Perfecto para explorar estados de hiperenfoque."}
        </p>
      </div>
    </div>
  );
}
