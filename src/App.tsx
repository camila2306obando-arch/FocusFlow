import React, { useState, useEffect } from "react";
import { Task, UserStats, Category, Priority, ThemeColor, ThemeBg } from "./types";
import { getFriendlyGreeting, updateStreak } from "./utils";
import XPStatus from "./components/XPStatus";
import QuickStats from "./components/QuickStats";
import FocusMode from "./components/FocusMode";
import VisualCalendar from "./components/VisualCalendar";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import NotesView from "./components/NotesView";
import AuthScreen from "./components/AuthScreen";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

import { 
  Sparkles, CheckSquare, Zap, Filter, Heart, Brain, CalendarRange, Clock, Coffee, ListTodo,
  LayoutDashboard, Trophy, Award, Target, BookOpen, Settings, Flame, ShieldAlert,
  ChevronRight, Calendar, ExternalLink, HelpCircle, Menu, X, StickyNote
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type AppView = "dashboard" | "focus" | "calendar" | "achievements" | "notes";

// Unlocked badges config
interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  color: string;
  progress: number;
  max: number;
  isUnlocked: boolean;
}

// Configuration mappings for customizable theme colors
const THEME_CONFIG = {
  violet: {
    primary: "violet-600",
    textLight: "text-violet-400",
    textLightHover: "hover:text-violet-300",
    activeTab: "bg-violet-600 text-white shadow-md shadow-violet-950/30",
    bgPill: "bg-violet-600/10",
    gradientBorder: "from-violet-600 via-indigo-500 to-sky-400",
    gradientOverlay: "from-violet-600/10 via-purple-600/5 to-slate-900/10",
    borderPill: "border-violet-500/20",
    accentBorder: "border-violet-500/30",
    badgeGlow: "bg-violet-600/10",
    badgeBorder: "border-violet-500/25",
    accentPillBg: "bg-violet-500/15",
    accentPillBorder: "border-violet-500/20",
    accentPillText: "text-violet-300",
    emptyStateGlow: "bg-violet-500/10",
    emptyStateBorder: "border-violet-500/20",
    emptyStateIcon: "text-violet-400",
    shadow: "shadow-violet-950/20",
    selectionClass: "selection:bg-violet-600/40 selection:text-violet-200"
  },
  emerald: {
    primary: "emerald-600",
    textLight: "text-emerald-400",
    textLightHover: "hover:text-emerald-300",
    activeTab: "bg-emerald-600 text-white shadow-md shadow-emerald-950/30",
    bgPill: "bg-emerald-600/10",
    gradientBorder: "from-emerald-600 via-teal-500 to-sky-450",
    gradientOverlay: "from-emerald-600/10 via-teal-600/5 to-slate-900/10",
    borderPill: "border-emerald-500/20",
    accentBorder: "border-emerald-500/30",
    badgeGlow: "bg-emerald-600/10",
    badgeBorder: "border-emerald-500/25",
    accentPillBg: "bg-emerald-500/15",
    accentPillBorder: "border-emerald-500/20",
    accentPillText: "text-emerald-300",
    emptyStateGlow: "bg-emerald-500/10",
    emptyStateBorder: "border-emerald-500/20",
    emptyStateIcon: "text-emerald-400",
    shadow: "shadow-emerald-950/20",
    selectionClass: "selection:bg-emerald-600/40 selection:text-emerald-200"
  },
  amber: {
    primary: "amber-600",
    textLight: "text-amber-400",
    textLightHover: "hover:text-amber-300",
    activeTab: "bg-amber-600 text-white shadow-md shadow-amber-950/30",
    bgPill: "bg-amber-600/10",
    gradientBorder: "from-amber-600 via-yellow-500 to-orange-450",
    gradientOverlay: "from-amber-600/10 via-yellow-600/5 to-slate-900/10",
    borderPill: "border-amber-500/20",
    accentBorder: "border-amber-500/30",
    badgeGlow: "bg-amber-600/10",
    badgeBorder: "border-amber-500/25",
    accentPillBg: "bg-amber-500/15",
    accentPillBorder: "border-amber-500/20",
    accentPillText: "text-amber-300",
    emptyStateGlow: "bg-amber-500/10",
    emptyStateBorder: "border-amber-500/20",
    emptyStateIcon: "text-amber-400",
    shadow: "shadow-amber-950/20",
    selectionClass: "selection:bg-amber-600/40 selection:text-amber-200"
  },
  rose: {
    primary: "rose-600",
    textLight: "text-rose-400",
    textLightHover: "hover:text-rose-300",
    activeTab: "bg-rose-600 text-white shadow-md shadow-rose-950/30",
    bgPill: "bg-rose-600/10",
    gradientBorder: "from-rose-600 via-pink-500 to-indigo-455",
    gradientOverlay: "from-rose-600/10 via-pink-600/5 to-slate-900/10",
    borderPill: "border-rose-500/20",
    accentBorder: "border-rose-500/30",
    badgeGlow: "bg-rose-600/10",
    badgeBorder: "border-rose-500/25",
    accentPillBg: "bg-rose-500/15",
    accentPillBorder: "border-rose-500/20",
    accentPillText: "text-rose-300",
    emptyStateGlow: "bg-rose-500/10",
    emptyStateBorder: "border-rose-500/20",
    emptyStateIcon: "text-rose-400",
    shadow: "shadow-rose-950/20",
    selectionClass: "selection:bg-rose-600/40 selection:text-rose-200"
  },
  sky: {
    primary: "sky-600",
    textLight: "text-sky-400",
    textLightHover: "hover:text-sky-300",
    activeTab: "bg-sky-600 text-white shadow-md shadow-sky-950/30",
    bgPill: "bg-sky-600/10",
    gradientBorder: "from-sky-600 via-blue-500 to-indigo-450",
    gradientOverlay: "from-sky-600/10 via-blue-600/5 to-slate-950/10",
    borderPill: "border-sky-500/20",
    accentBorder: "border-sky-500/30",
    badgeGlow: "bg-sky-600/10",
    badgeBorder: "border-sky-500/25",
    accentPillBg: "bg-sky-500/15",
    accentPillBorder: "border-sky-500/20",
    accentPillText: "text-sky-300",
    emptyStateGlow: "bg-sky-500/10",
    emptyStateBorder: "border-sky-500/20",
    emptyStateIcon: "text-sky-400",
    shadow: "shadow-sky-950/20",
    selectionClass: "selection:bg-sky-600/40 selection:text-sky-200"
  },
  pink: {
    primary: "pink-600",
    textLight: "text-pink-400",
    textLightHover: "hover:text-pink-300",
    activeTab: "bg-pink-600 text-white shadow-md shadow-pink-950/30",
    bgPill: "bg-pink-600/10",
    gradientBorder: "from-pink-500 via-rose-500 to-amber-400",
    gradientOverlay: "from-pink-600/10 via-rose-600/5 to-slate-900/10",
    borderPill: "border-pink-500/20",
    accentBorder: "border-pink-500/30",
    badgeGlow: "bg-pink-600/10",
    badgeBorder: "border-pink-500/25",
    accentPillBg: "bg-pink-500/15",
    accentPillBorder: "border-pink-500/20",
    accentPillText: "text-pink-300",
    emptyStateGlow: "bg-pink-500/10",
    emptyStateBorder: "border-pink-500/30",
    emptyStateIcon: "text-pink-400",
    shadow: "shadow-pink-950/20",
    selectionClass: "selection:bg-pink-600/40 selection:text-pink-200"
  },
  white: {
    primary: "slate-300",
    textLight: "text-slate-300",
    textLightHover: "hover:text-slate-200",
    activeTab: "bg-slate-200 text-slate-900 font-bold shadow-md shadow-slate-350/10",
    bgPill: "bg-white/10",
    gradientBorder: "from-white via-slate-300 to-slate-400",
    gradientOverlay: "from-white/10 via-slate-200/5 to-slate-900/10",
    borderPill: "border-slate-200/20",
    accentBorder: "border-slate-200/30",
    badgeGlow: "bg-white/10",
    badgeBorder: "border-slate-200/25",
    accentPillBg: "bg-white/15",
    accentPillBorder: "border-slate-200/20",
    accentPillText: "text-slate-300",
    emptyStateGlow: "bg-white/10",
    emptyStateBorder: "border-slate-300/20",
    emptyStateIcon: "text-slate-400",
    shadow: "shadow-white/10",
    selectionClass: "selection:bg-white/30 selection:text-white"
  },
  black: {
    primary: "neutral-950",
    textLight: "text-neutral-400",
    textLightHover: "hover:text-neutral-300",
    activeTab: "bg-[#090D1A] text-white hover:bg-zinc-900 shadow-md border border-zinc-800",
    bgPill: "bg-black/40",
    gradientBorder: "from-slate-700 via-slate-800 to-slate-950",
    gradientOverlay: "from-slate-950/10 via-slate-900/5 to-black/10",
    borderPill: "border-slate-800/40",
    accentBorder: "border-slate-800/30",
    badgeGlow: "bg-black/20",
    badgeBorder: "border-slate-800/40",
    accentPillBg: "bg-black/30",
    accentPillBorder: "border-slate-800/30",
    accentPillText: "text-slate-400",
    emptyStateGlow: "bg-black/20",
    emptyStateBorder: "border-slate-800/20",
    emptyStateIcon: "text-slate-400",
    shadow: "shadow-black",
    selectionClass: "selection:bg-stone-800 selection:text-slate-200"
  },
  yellow: {
    primary: "yellow-500",
    textLight: "text-yellow-400",
    textLightHover: "hover:text-yellow-300",
    activeTab: "bg-yellow-500 text-slate-950 font-bold shadow-md shadow-yellow-950/30",
    bgPill: "bg-yellow-500/10",
    gradientBorder: "from-yellow-500 via-amber-400 to-orange-400",
    gradientOverlay: "from-yellow-400/10 via-amber-500/5 to-slate-900/10",
    borderPill: "border-yellow-500/20",
    accentBorder: "border-yellow-500/30",
    badgeGlow: "bg-yellow-500/10",
    badgeBorder: "border-yellow-500/25",
    accentPillBg: "bg-yellow-500/15",
    accentPillBorder: "border-yellow-500/20",
    accentPillText: "text-yellow-300",
    emptyStateGlow: "bg-yellow-500/10",
    emptyStateBorder: "border-yellow-500/20",
    emptyStateIcon: "text-yellow-400",
    shadow: "shadow-yellow-950/20",
    selectionClass: "selection:bg-yellow-500/40 selection:text-yellow-250"
  }
};

// Configuration mappings for background colors
const BG_CONFIG = {
  blue: {
    bgClass: "bg-[#090D1A] text-[#F8FAFC]",
    sidebarBg: "bg-[#0B0F19]/90 border-slate-800/70",
    cardClass: "bg-slate-800/35 backdrop-blur-md border border-slate-700/40 text-[#F8FAFC]",
    innerInputClass: "bg-slate-900/60 text-slate-200 border-slate-700/50",
    subtext: "text-slate-400",
    headerText: "text-slate-100",
    brandText: "text-white",
    pillBg: "bg-slate-800/15 border-slate-700/20",
    emptyBg: "bg-slate-900/35 border-slate-800",
    badgeBg: "bg-slate-800/20 border-slate-700/20",
    buttonBgSec: "bg-slate-900/40 border-slate-700/60 hover:bg-slate-900/80 text-slate-400",
    mainHeaderBg: "bg-[#0B0F19]/40 border-b border-slate-800/50",
    glowOpacity: "opacity-100",
    isLight: false
  },
  black: {
    bgClass: "bg-black text-zinc-100",
    sidebarBg: "bg-zinc-950 border-r border-zinc-900",
    cardClass: "bg-zinc-900/50 border border-zinc-800 text-zinc-100",
    innerInputClass: "bg-zinc-950 text-zinc-200 border-zinc-800",
    subtext: "text-zinc-500",
    headerText: "text-zinc-100",
    brandText: "text-white",
    pillBg: "bg-zinc-900 border-zinc-800",
    emptyBg: "bg-zinc-950 border-zinc-900",
    badgeBg: "bg-zinc-950 border-zinc-900",
    buttonBgSec: "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900/90",
    mainHeaderBg: "bg-zinc-950 border-b border-zinc-900",
    glowOpacity: "opacity-40",
    isLight: false
  },
  white: {
    bgClass: "bg-[#F8FAFC] text-slate-900",
    sidebarBg: "bg-white border-r border-slate-200 shadow-sm",
    cardClass: "bg-white border border-slate-200 text-slate-800 shadow-sm",
    innerInputClass: "bg-slate-50 text-slate-800 border-slate-300",
    subtext: "text-slate-500",
    headerText: "text-slate-800",
    brandText: "text-slate-950",
    pillBg: "bg-slate-100 border-slate-200",
    emptyBg: "bg-slate-50 border-slate-200",
    badgeBg: "bg-slate-50 border-slate-200",
    buttonBgSec: "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200",
    mainHeaderBg: "bg-white border-b border-slate-200 shadow-sm",
    glowOpacity: "opacity-0",
    isLight: true
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 1,
    totalTasksCompleted: 0,
    totalFocusSessions: 0,
    totalFocusMinutes: 0
  });

  // Customize layout themes
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem("focusflow_theme");
      const valid = ["violet", "emerald", "amber", "rose", "sky", "pink", "white", "black", "yellow"];
      if (stored && valid.includes(stored)) {
        return stored as ThemeColor;
      }
    } catch (_) {}
    return "violet";
  });

  // Customize application background (blue, black, white)
  const [themeBg, setThemeBg] = useState<ThemeBg>(() => {
    try {
      const stored = localStorage.getItem("focusflow_bg");
      if (stored === "blue" || stored === "black" || stored === "white") {
        return stored as ThemeBg;
      }
    } catch (_) {}
    return "blue";
  });

  // Collapsible sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("focusflow_sidebar_collapsed");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return false;
  });

  // Track dynamic changes
  useEffect(() => {
    localStorage.setItem("focusflow_theme", themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem("focusflow_bg", themeBg);
  }, [themeBg]);

  useEffect(() => {
    localStorage.setItem("focusflow_sidebar_collapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const appTheme = THEME_CONFIG[themeColor];
  const appBg = BG_CONFIG[themeBg];

  const [pointsBubble, setPointsBubble] = useState<{ id: number; amount: number; text: string } | null>(null);
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Category | "Todas">("Todas");
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Hydrate Stats from LocalStorage
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem("focusflow_stats");
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error("Error loading stats from local storage data", e);
    }
  }, []);

  // Load Tasks from Firestore
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(db, "tareas");
    const q = query(tasksRef, where("uid", "==", user.uid));
    
    // Real-time synchronization
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTasks: Task[] = [];
      snapshot.forEach((doc) => {
        dbTasks.push(doc.data() as Task);
      });
      // Sort tasks sequentially by creation if needed, currently leaving them as they come
      setTasks(dbTasks);
    }, (error) => {
      console.error("Error fetching realtime tasks:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Save Stats changes to LocalStorage
  useEffect(() => {
    localStorage.setItem("focusflow_stats", JSON.stringify(stats));
  }, [stats]);

  // Dynamic self-compassionate greeting
  const { greeting, subheading } = getFriendlyGreeting();

  // Task events
  const handleAddTask = async (title: string, category: Category, priority: Priority, deadline?: string) => {
    if (!user) return;
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random()}`,
      title,
      category,
      priority,
      completed: false,
      deadline,
      subtasks: [],
      createdAt: new Date().toISOString().split("T")[0]
    };

    try {
      await setDoc(doc(db, "tareas", newTask.id), {
        uid: user.uid,
        ...newTask
      });
      triggerAwardXP(15, "¡Planificado!"); // Dopamine hit for registering a goal
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const newCompleted = !task.completed;
      await updateDoc(doc(db, "tareas", id), {
        completed: newCompleted
      });

      if (newCompleted) {
        triggerAwardXP(15, "¡Buen trabajo!"); // Reward task completion with 15 XP
        // Update stats
        setStats((curr) => ({
          ...curr,
          totalTasksCompleted: curr.totalTasksCompleted + 1,
        }));
      }
    } catch (e) {
      console.error("Error updating task", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "tareas", id));
    } catch (e) {
      console.error("Error deleting task", e);
    }
  };

  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "tareas", id), updatedFields);
    } catch (e) {
      console.error("Error updating fields", e);
    }
  };

  const handleAssignTimeBlock = async (taskId: string, day: string | undefined, hour: string | undefined, color?: string) => {
    if (!user) return;
    const updatePayload: any = {
      timeBlockDay: day === undefined ? null : day,
      timeBlockHour: hour === undefined ? null : hour
    };
    if (color !== undefined) {
      updatePayload.color = color;
    }
    
    try {
      await updateDoc(doc(db, "tareas", taskId), updatePayload);
    } catch (e) {
      console.error("Error updating time block", e);
    }
  };

  const handleUpdateTaskColor = async (taskId: string, color: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "tareas", taskId), { color });
    } catch (e) {
      console.error(e);
    }
  };

  // Quick tasks directly from calendar slots
  const handleAddTaskQuick = async (title: string, category: Category, priority: Priority, day: string, hour: string, color?: string) => {
    if (!user) return;
    const newTask: Task = {
      id: `task-quick-${Date.now()}`,
      title,
      category,
      priority,
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString().split("T")[0],
      timeBlockDay: day,
      timeBlockHour: hour,
      color: color
    };

    try {
      await setDoc(doc(db, "tareas", newTask.id), {
        uid: user.uid,
        ...newTask
      });
      triggerAwardXP(10, "Bloqueado");
    } catch (error) {
      console.error("Error adding quick task:", error);
    }
  };

  const handleFocusTaskAction = (taskId: string) => {
    setSelectedTaskForFocus(taskId);
    setActiveView("focus");
  };

  // Gamification rewards engine
  const triggerAwardXP = (amount: number, reasonText: string) => {
    setPointsBubble({
      id: Date.now(),
      amount,
      text: reasonText
    });

    setStats((prev) => {
      const newXP = prev.xp + amount;
      const nextLevel = Math.floor(newXP / 100) + 1;
      const levelUp = nextLevel > prev.level;
      
      const todayStr = new Date().toISOString().split("T")[0];
      const streakObj = updateStreak(prev.lastActiveDate, prev.streak);

      return {
        ...prev,
        xp: newXP,
        level: nextLevel,
        streak: streakObj.newStreak,
        lastActiveDate: streakObj.newDate
      };
    });

    // Auto clear bubble after 3.2s
    setTimeout(() => {
      setPointsBubble(null);
    }, 3200);
  };

  // Focus completion handler
  const handleCompleteFocusSession = (minutes: number, xpPoints: number, description: string) => {
    triggerAwardXP(xpPoints, description);
    setStats((curr) => ({
      ...curr,
      totalFocusSessions: curr.totalFocusSessions + 1,
      totalFocusMinutes: curr.totalFocusMinutes + minutes
    }));
  };

  // Filter tasks based on settings
  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = activeCategoryFilter === "Todas" || t.category === activeCategoryFilter;
    const matchesCompleted = t.completed === showCompleted;
    return matchesCategory && matchesCompleted;
  });

  const getFilteredCounts = () => {
    const pending = tasks.filter((t) => !t.completed).length;
    const completed = tasks.filter((t) => t.completed).length;
    return { pending, completed };
  };

  const counts = getFilteredCounts();

  // Custom premium badges list for user achievements
  const badges: Badge[] = [
    {
      id: "first_one",
      name: "Destello de Enfoque",
      description: "Completa tu primer objetivo de la lista.",
      requirement: "1 Tarea completada",
      icon: "⚡",
      color: "from-amber-400 to-orange-500",
      progress: Math.min(stats.totalTasksCompleted, 1),
      max: 1,
      isUnlocked: stats.totalTasksCompleted >= 1
    },
    {
      id: "focus_pro",
      name: "Sabio del Hiperenfoque",
      description: "Acumula 25 minutos activos en sesiones.",
      requirement: "25 Minutos de enfoque",
      icon: "🧘",
      color: "from-purple-500 to-indigo-600",
      progress: Math.min(stats.totalFocusMinutes, 25),
      max: 25,
      isUnlocked: stats.totalFocusMinutes >= 25
    },
    {
      id: "streak_silver",
      name: "Constancia Serena",
      description: "Mantén una racha de enfoque saludable.",
      requirement: "Racha de 3 días",
      icon: "🔥",
      color: "from-rose-500 to-red-600",
      progress: Math.min(stats.streak, 3),
      max: 3,
      isUnlocked: stats.streak >= 3
    },
    {
      id: "high_scheduler",
      name: "Dueño del Tiempo",
      description: "Asigna metas específicas usando el time blocking.",
      requirement: "3 Tareas asignadas a horarios",
      icon: "📅",
      color: "from-sky-500 to-emerald-600",
      progress: Math.min(tasks.filter(t => t.timeBlockHour).length, 3),
      max: 3,
      isUnlocked: tasks.filter(t => t.timeBlockHour).length >= 3
    }
  ];

  return (
    <div className={`h-screen ${appBg.bgClass} ${appTheme.selectionClass} font-sans flex flex-col md:flex-row antialiased relative overflow-hidden transition-colors duration-500`}>
      
      {/* Welcome Screen Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 cursor-pointer"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              className={`text-center p-10 rounded-[2rem] border border-white/10 shadow-2xl max-w-sm mx-4 w-full ${appBg.isLight ? 'bg-white/90 shadow-indigo-500/10' : 'bg-slate-900/90 shadow-indigo-500/10'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className={`w-20 h-20 mx-auto bg-gradient-to-tr ${appTheme.gradientBorder} rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20`}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-4xl font-extrabold mb-2 tracking-tight ${appBg.isLight ? 'text-slate-900' : 'text-white'}`}
              >
                Focus<span className={appTheme.textLight}>Flow</span>
              </motion.h1>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-medium text-emerald-400 mb-4 uppercase tracking-widest text-[11px]"
              >
                Bienvenido
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-sm leading-relaxed ${appBg.isLight ? 'text-slate-600' : 'text-slate-400'}`}
              >
                La app que te ayuda a concentrarte diariamente.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic atmospheric mesh backgrounds */}
      <div className={`absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none transition-opacity duration-500 ${appBg.glowOpacity}`} />
      <div className={`absolute top-1/4 right-5 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none transition-opacity duration-500 ${appBg.glowOpacity}`} />
      <div className={`absolute bottom-5 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none transition-opacity duration-500 ${appBg.glowOpacity}`} />

      {!user && !showWelcome && authChecked ? (
        <AuthScreen appBg={appBg} appTheme={appTheme} />
      ) : user ? (
      <>
      {/* Mobile Top Header */}
      <header className={`md:hidden flex items-center justify-between p-4 border-b z-40 shrink-0 ${appBg.sidebarBg} ${appBg.isLight ? "border-slate-200" : "border-slate-800/50"} backdrop-blur-md`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${appTheme.gradientBorder} p-[1.5px] shadow-sm`}>
            <div className={`w-full h-full ${appBg.isLight ? "bg-slate-100" : "bg-[#090D1A]"} rounded-[10px] flex items-center justify-center`}>
              <Sparkles className={`w-4 h-4 ${appTheme.textLight}`} />
            </div>
          </div>
          <span className={`font-extrabold tracking-tight ${appBg.isLight ? "text-slate-900" : "text-white"} text-lg`}>Focus<span className={appTheme.textLight}>Flow</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className={`w-6 h-6 ${appBg.isLight ? "text-slate-600" : "text-slate-400"}`} />
        </button>
      </header>

      {/* Mobile Overlay for Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR SYSTEM (Notion / Linear inspired list structure) --- */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full shrink-0 flex flex-col justify-between border-r shadow-2xl md:shadow-none pointer-events-auto transition-all duration-300 ease-in-out
          ${appBg.sidebarBg} backdrop-blur-xl ${appBg.isLight ? 'border-slate-200/60' : 'border-slate-800/40'}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isSidebarCollapsed ? "md:w-[88px]" : "md:w-[280px]"} w-[280px]`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo & Brand Header */}
          <div className={`h-[72px] px-5 border-b shrink-0 ${appBg.isLight ? "border-slate-200 bg-slate-50/50" : "border-slate-800/50 bg-[#070A12]/40"} flex justify-between items-center transition-all duration-300`}>
            {/* Header Content */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'mx-auto' : 'gap-3 overflow-hidden'}`}>
              <div className={`shrink-0 w-8.5 h-8.5 rounded-xl bg-gradient-to-tr ${appTheme.gradientBorder} p-[1.5px] shadow-lg shadow-purple-950/20`}>
                <div className={`w-full h-full ${appBg.isLight ? "bg-slate-100" : "bg-[#090D1A]"} rounded-[10px] flex items-center justify-center`}>
                  <Sparkles className={`w-4.5 h-4.5 ${appTheme.textLight}`} />
                </div>
              </div>
              
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: -10 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col whitespace-nowrap"
                  >
                    <span className={`font-sans text-base font-extrabold tracking-tight ${appBg.isLight ? "text-slate-850" : "text-white"} flex items-center gap-1 leading-none`}>
                      Focus<span className={appTheme.textLight}>Flow</span>
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#6366F1] mt-1 block">Compañero</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden md:flex p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all focus:outline-none absolute -right-3 top-6 bg-slate-900 border border-slate-700 z-10 items-center justify-center`}
              title={isSidebarCollapsed ? "Expandir panel" : "Plegar panel"}
            >
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pt-4">
            {/* User Mini Profile Badge (Duolingo & Finch style stats overview inside side bar) */}
          <div className={`mx-4 my-4 p-3 ${appBg.pillBg} rounded-2xl flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-inner shrink-0 relative">
              🦄
              <span className="absolute -bottom-1 -right-1 bg-slate-700 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-slate-900 px-1">
                L{stats.level}
              </span>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-bold ${appBg.headerText} truncate`}>Focus Master</h4>
                <p className={`text-[10px] ${appBg.subtext} font-mono mt-0.5`}>{stats.xp} Total XP</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-2">
            <button
              onClick={() => { setActiveView("dashboard"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-start h-11 px-3.5 rounded-xl text-xs font-bold font-sans transition-all group overflow-hidden ${
                activeView === "dashboard"
                  ? appTheme.activeTab
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
              title="Mi Panel Diario"
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeView === "dashboard" ? "text-white" : appTheme.textLight}`} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-left">Mi Panel Diario</span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-black/20 text-slate-400 shrink-0">
                      {counts.pending}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => { setActiveView("focus"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-start h-11 px-3.5 rounded-xl text-xs font-bold font-sans transition-all group overflow-hidden ${
                activeView === "focus"
                  ? appTheme.activeTab
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
              title="Cámara de Enfoque"
            >
              <Clock className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeView === "focus" ? "text-white" : "text-sky-450"}`} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-left">Imán de Enfoque</span>
                    {stats.totalFocusMinutes > 0 && (
                      <span className="text-[10px] font-mono text-sky-300 font-semibold shrink-0">
                        {stats.totalFocusMinutes}m
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => { setActiveView("calendar"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-start h-11 px-3.5 rounded-xl text-xs font-bold font-sans transition-all group overflow-hidden ${
                activeView === "calendar"
                  ? appTheme.activeTab
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
              title="Organización por bloking"
            >
              <CalendarRange className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeView === "calendar" ? "text-white" : "text-emerald-400"}`} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="flex-1 flex items-center whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-left">Organización por bloking</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => { setActiveView("achievements"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-start h-11 px-3.5 rounded-xl text-xs font-bold font-sans transition-all group overflow-hidden ${
                activeView === "achievements"
                  ? appTheme.activeTab
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
              title="Logros y Senda"
            >
              <Trophy className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeView === "achievements" ? "text-white" : "text-amber-400"}`} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-left">Logros y Senda</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => { setActiveView("notes"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-start h-11 px-3.5 rounded-xl text-xs font-bold font-sans transition-all group overflow-hidden ${
                activeView === "notes"
                  ? appTheme.activeTab
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
              }`}
              title="Bloc de notas"
            >
              <StickyNote className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeView === "notes" ? "text-white" : "text-yellow-400"}`} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="flex-1 flex items-center whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-left">Bloc de notas</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </nav>

          {/* Theme customizer color circle dots */}
          <div className="mx-4 mt-6">
            {!isSidebarCollapsed ? (
              <div className={`p-3 rounded-2xl border ${appBg.isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/15 border-slate-700/20"}`}>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                  Color Interfaz
                </span>
                <div className="grid grid-cols-5 gap-1.5 justify-between">
                  {(["violet", "emerald", "amber", "rose", "sky", "pink", "white", "black", "yellow"] as const).map((color) => {
                    const dotColors = {
                      violet: "bg-violet-500 shadow-violet-500/30",
                      emerald: "bg-emerald-500 shadow-emerald-500/30",
                      amber: "bg-amber-500 shadow-amber-500/30",
                      rose: "bg-rose-500 shadow-rose-500/30",
                      sky: "bg-sky-500 shadow-sky-500/30",
                      pink: "bg-pink-500 shadow-pink-500/30",
                      white: "bg-white border border-slate-350 shadow-slate-300/30",
                      black: "bg-black shadow-neutral-950/40 border border-zinc-800",
                      yellow: "bg-yellow-500 shadow-yellow-500/30"
                    };
                    const colorNames = {
                      violet: "Violeta",
                      emerald: "Esmeralda",
                      amber: "Ámbar",
                      rose: "Rosa",
                      sky: "Sky",
                      pink: "Rosado",
                      white: "Blanco",
                      black: "Negro",
                      yellow: "Amarillo"
                    };
                    const isSelected = themeColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? "ring-2 ring-indigo-500 scale-115" : "hover:scale-110"
                        }`}
                        title={`Estilo ${colorNames[color]}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${dotColors[color]} shadow-md`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    const colors = ["violet", "emerald", "amber", "rose", "sky", "pink", "white", "black", "yellow"] as const;
                    const nextIdx = (colors.indexOf(themeColor) + 1) % colors.length;
                    setThemeColor(colors[nextIdx]);
                  }}
                  className={`p-2 rounded-xl transition-all border ${appBg.isLight ? "bg-white border-slate-200" : "bg-slate-800/35 border-slate-700/30"} text-slate-400 hover:text-white`}
                  title="Cambiar color de interfaz (Click para alternar)"
                >
                  <span className={`w-3.5 h-3.5 rounded-full block ${
                    themeColor === "violet" ? "bg-violet-400" :
                    themeColor === "emerald" ? "bg-emerald-400" :
                    themeColor === "amber" ? "bg-amber-400" :
                    themeColor === "rose" ? "bg-rose-400" :
                    themeColor === "sky" ? "bg-sky-400" :
                    themeColor === "pink" ? "bg-pink-400" :
                    themeColor === "white" ? "bg-slate-300" :
                    themeColor === "black" ? "bg-neutral-800" : "bg-yellow-400"
                  } animate-pulse`} />
                </button>
              </div>
            )}
          </div>

          {/* App Background customizer (blue, black, white) */}
          <div className="mx-4 mt-4">
            {!isSidebarCollapsed ? (
              <div className={`p-3 rounded-2xl border ${appBg.isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/15 border-slate-700/20"}`}>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                  Fondo de la App
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(["blue", "black", "white"] as const).map((bgItem) => {
                    const bgLabels = {
                      blue: "Azul",
                      black: "Negro",
                      white: "Blanco"
                    };
                    const bgButtons = {
                      blue: "bg-[#090D1A] border-[#1E293B] hover:bg-[#0c1428]",
                      black: "bg-black border-zinc-800 hover:bg-zinc-900",
                      white: "bg-white border-slate-200 hover:bg-slate-50 text-slate-900"
                    };
                    const isSelected = themeBg === bgItem;
                    return (
                      <button
                        key={bgItem}
                        onClick={() => setThemeBg(bgItem)}
                        className={`text-[10px] py-1 px-1 rounded-lg border transition-all text-center leading-none font-medium truncate ${bgButtons[bgItem]} ${
                          isSelected 
                            ? "ring-2 ring-indigo-500 border-transparent font-bold" 
                            : "opacity-60 hover:opacity-100"
                        } ${appBg.isLight && bgItem === 'white' ? 'text-slate-900' : ''}`}
                      >
                        {bgLabels[bgItem]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    const bgs = ["blue", "black", "white"] as const;
                    const nextBgIdx = (bgs.indexOf(themeBg) + 1) % bgs.length;
                    setThemeBg(bgs[nextBgIdx]);
                  }}
                  className={`p-2 rounded-xl transition-all border ${appBg.isLight ? "bg-white border-slate-200" : "bg-slate-800/35 border-slate-700/30"} text-slate-400 hover:text-white`}
                  title="Cambiar fondo de app"
                >
                  🎨
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#070A12]/20 border-t border-slate-800/50 hidden md:flex flex-col shrink-0"
            >
              <div className="p-4 flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono whitespace-nowrap overflow-hidden">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce shrink-0" />
                  <span>Racha: {stats.streak} días</span>
                </div>
                <div className="flex w-full items-center justify-between mt-2">
                  <p className="text-[9px] text-slate-600 font-mono whitespace-nowrap overflow-hidden">
                    {user?.email || "Invitado"}
                  </p>
                  <button 
                    onClick={() => signOut(auth)} 
                    className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded"
                    title="Cerrar Sessión"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* --- MAIN PAGE WORKSPACE (Notion minimalism, Linear dark precision) --- */}
      <main className="flex-1 min-w-0 overflow-y-auto h-full px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-12 custom-scrollbar relative z-10">
        
        {/* Top-Right Ambient Floating Info */}
        <div className="absolute top-6 right-8 hidden xl:flex items-center gap-3">
          {/* Removed floaters to improve hierarchy and spacing */}
        </div>

        {/* Dynamic header row according to activeView */}
        <div className="pb-6 mb-8 border-b border-slate-800/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <p className="text-[11px] font-mono tracking-widest text-[#6366F1] uppercase font-bold mb-1.5 opacity-80">
                {activeView === "dashboard" && "Dashboard principal"}
                {activeView === "focus" && "Cámara de inmersión"}
                {activeView === "calendar" && "Organización por bloking"}
                {activeView === "achievements" && "Senda de logros interactiva"}
                {activeView === "notes" && "Bloc de notas"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
                {activeView === "dashboard" && (
                  <>
                    <span>{greeting}</span>
                  </>
                )}
                {activeView === "focus" && "Espacio de Hiperenfoque libre"}
                {activeView === "calendar" && "Agenda Horaria de Bloques"}
                {activeView === "achievements" && "Tus Hitos y Senda Estelar"}
                {activeView === "notes" && "Gestor de notas rápidas"}
              </h1>
              {activeView === "dashboard" && (
                <p className="text-sm text-slate-400 mt-2 font-medium select-none">{subheading}</p>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0 shadow-sm">
              <span className={`text-[12px] font-mono font-bold bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 ${appTheme.textLight}`}>
                <Brain className="w-4 h-4" />
                Estación de concentración
              </span>
            </div>
          </div>
        </div>

        {/* Global Level Indicator Row on top */}
        <div className="mb-8">
          <XPStatus stats={stats} pointsBubble={pointsBubble} themeColor={themeColor} themeBg={themeBg} />
        </div>

        {/* --- ROUTED VIEWS WORKSPACE --- */}
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Daily progress graphs & Quotes inside Apple Health visual bento */}
              <QuickStats stats={stats} todayTasks={tasks.filter(t => t.createdAt === new Date().toISOString().split("T")[0])} themeColor={themeColor} themeBg={themeBg} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Area (7 columns): Form & task list */}
                <div className="lg:col-span-7 space-y-5">
                  <TaskForm onAddTask={handleAddTask} themeColor={themeColor} themeBg={themeBg} />

                  {/* Notion-style task list visual box */}
                  <div className={`${appBg.cardClass} rounded-2xl p-5 shadow-lg relative`}>
                    
                    {/* Header bar controls */}
                    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 PB-1 border-b ${appBg.isLight ? "border-slate-200" : "border-slate-700/20"} pb-3`}>
                      <div className="flex items-center gap-2">
                        <ListTodo className={`w-4 h-4 ${appTheme.textLight}`} />
                        <span className={`text-xs font-bold ${appBg.headerText} uppercase tracking-wider font-mono`}>
                          Lista de Objetivos
                        </span>
                      </div>

                      {/* Status selectors */}
                      <div className={`flex p-0.5 ${appBg.pillBg} rounded-xl text-[10px]`}>
                        <button
                          onClick={() => setShowCompleted(false)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            !showCompleted ? `${appTheme.activeTab}` : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Pendientes ({counts.pending})
                        </button>
                        <button
                          onClick={() => setShowCompleted(true)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            showCompleted ? `${appTheme.activeTab}` : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Completadas ({counts.completed})
                        </button>
                      </div>
                    </div>

                    {/* Quick filter pills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(["Todas", "Estudios", "Trabajo", "Personal", "Hogar", "Salud", "Ocio"] as const).map((cat) => {
                        const isSelected = activeCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategoryFilter(cat)}
                            className={`text-[11px] px-3 py-1 rounded-xl border font-bold transition-all ${
                              isSelected
                                ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                                : "bg-slate-900/20 border-slate-700/30 text-slate-400 hover:bg-slate-900/45 hover:text-slate-200"
                            }`}
                          >
                            {cat === "Todas" ? "🔍 Mostrar Todas" : cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Task cards list */}
                    <div className="space-y-3.5">
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteTask}
                            onUpdateTask={handleUpdateTask}
                            onFocusTask={handleFocusTaskAction}
                            themeColor={themeColor}
                            themeBg={themeBg}
                          />
                        ))
                      ) : (
                        /* Beautiful high fidelity Apple/Linear styled empty state block */
                        <div className={`bg-slate-900/35 border border-dashed border-slate-800 p-12 text-center rounded-2xl`}>
                          <div className={`w-16 h-16 rounded-full ${appTheme.emptyStateGlow} border ${appTheme.emptyStateBorder} flex items-center justify-center mx-auto mb-4 animate-bounce`}>
                            <Sparkles className={`w-7 h-7 ${appTheme.emptyStateIcon}`} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200">No hay objetivos en esta vista</h4>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
                            Eso es un lienzo en blanco fantástico. Te recomendamos planificar una acción que tome solo 2 minutos de esfuerzo. ¡A por ello!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Area (5 columns): Solitary Focus Mini control & Onboarding tips */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Miniature clock module */}
                  <div className={`p-0.5 bg-gradient-to-br ${appTheme.gradientBorder} bg-opacity-20 rounded-2xl border border-slate-800 shadow-xl overflow-hidden`}>
                    <FocusMode
                      tasks={tasks}
                      onCompleteSession={handleCompleteFocusSession}
                      selectedTaskIdFromParent={selectedTaskForFocus}
                      themeColor={themeColor}
                      themeBg={themeBg}
                    />
                  </div>

                  {/* Notion tip guide block */}
                  <div className={`${appBg.cardClass} p-5 rounded-2xl`}>
                    <h4 className={`text-xs uppercase tracking-widest font-mono ${appTheme.textLight} font-bold mb-2`}>Comandos Rápidos de Enfoque</h4>
                    <p className={`text-xs ${appBg.subtext} leading-normal mb-3`}>
                      Cuando estés listo para concentrarte de verdad, haz clic en el botón de reproducción rápida (▶) al lado de cualquier objetivo para vincularlo de inmediato al temporizador de enfoque y silenciar toda distorsión mental.
                    </p>
                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => setActiveView("focus")}
                        className={`text-[11px] font-bold ${appTheme.accentPillText} hover:text-white ${appTheme.accentPillBg} px-3 py-1.5 rounded-xl border ${appTheme.accentPillBorder} transition-all`}
                      >
                        Ir a espacio inmersivo
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeView === "focus" && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Immersive Focus mode layout widget */}
              <div className={`p-1.5 bg-gradient-to-br ${appTheme.gradientBorder} bg-opacity-25 via-[#0B0F19] to-[#0B0F19] rounded-3xl border ${appTheme.badgeBorder} shadow-2xl`}>
                <FocusMode
                  tasks={tasks}
                  onCompleteSession={handleCompleteFocusSession}
                  selectedTaskIdFromParent={selectedTaskForFocus}
                  themeColor={themeColor}
                  themeBg={themeBg}
                />
              </div>

              {/* Special ADHD Tips box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    📚 Técnica Pomodoro
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                    Divide tu jornada en fases fijas de 25 minutos y 5 de recreo. Ideal si sientes parálisis del esfuerzo o un atasco cognitivo. Te ayuda a empezar.
                  </p>
                </div>
                <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase bg-sky-500/15 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-md">
                    ⏳ Flujo Flowtime
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                    Flujo libre que cuenta hacia arriba de forma pacífica sin avisos agresivos. Excelente para cuando sientes ráfagas de hiperenfoque creativo e ignoras distracciones de forma natural.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              {/* Full width scheduler design */}
              <VisualCalendar
                tasks={tasks}
                onAssignTimeBlock={handleAssignTimeBlock}
                onUpdateTaskColor={handleUpdateTaskColor}
                onAddTaskQuick={handleAddTaskQuick}
                themeColor={themeColor}
                themeBg={themeBg}
              />
            </motion.div>
          )}

          {activeView === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Duolingo style progression statistics */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-[#0B0F19] to-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Award className="text-amber-400 w-5 h-5 animate-pulse" />
                    Senda de Enfoque y Recompensas
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal max-w-md">
                    ¡Tu cerebro libera dopamina de calidad cada vez que logras pequeñas victorias! Desbloquea estas insignias exclusivas completando tareas y sumando minutos en tu drone protector.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[90px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Streak Máx</span>
                    <p className="text-xl font-bold font-mono text-amber-500 mt-0.5">{stats.streak}d</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[90px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Total XP</span>
                    <p className="text-xl font-bold font-mono text-violet-400 mt-0.5">{stats.xp}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[90px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Completadas</span>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.totalTasksCompleted}</p>
                  </div>
                </div>
              </div>

              {/* Achievements Grid blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const percent = Math.min(Math.round((badge.progress / badge.max) * 100), 100);

                  return (
                    <div
                      key={badge.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        badge.isUnlocked
                          ? "bg-slate-800/40 border-violet-500/25"
                          : "bg-[#090D1A]/55 border-slate-800/80"
                      }`}
                    >
                      {/* Back illuminated glow for unlocked insignias */}
                      {badge.isUnlocked && (
                        <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl" />
                      )}

                      <div className="flex gap-3.5 items-start">
                        {/* Huge aesthetic icon badge */}
                        <div
                          className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl shadow-lg relative ${
                            badge.isUnlocked
                              ? `bg-gradient-to-br ${badge.color} text-white`
                              : "bg-slate-800 border border-slate-700/40 text-slate-500 grayscale opacity-45"
                          }`}
                        >
                          <span>{badge.icon}</span>
                          {badge.isUnlocked && (
                            <span className="absolute -top-1 -right-1 text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1 rounded-full animate-bounce">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-100">{badge.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {badge.progress} / {badge.max}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-normal">
                            {badge.description}
                          </p>
                          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest mt-1.5 font-mono">
                            Req: {badge.requirement}
                          </p>
                        </div>
                      </div>

                      {/* Insignia achievement track */}
                      <div className="mt-4">
                        <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden p-[1px] border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              badge.isUnlocked
                                ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                                : "bg-slate-700"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Duolingo level reward callout card */}
              <div className="bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-slate-900/10 p-5 rounded-2xl border border-violet-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-3xl">🏅</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">¡Siguiente gran hito a la vista!</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Sube tu perfil al nivel {stats.level + 1} para reclamar nuevos avatares mágicos y colores de interfaz.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView("dashboard")}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  ¡Ir a Avanzar!
                </button>
              </div>
            </motion.div>
          )}

          {activeView === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-5xl mx-auto"
            >
              <NotesView themeColor={themeColor} themeBg={themeBg} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Mobile responsive Quick Tabs Navigation Row */}
      <div className={`flex md:hidden ${appBg.isLight ? "bg-white border-slate-200" : "bg-[#0A0E1A] border-slate-800"} border-t sticky bottom-0 left-0 right-0 z-50 p-1 bg-opacity-95 backdrop-blur-md justify-around shrink-0`}>
        <button
          onClick={() => setActiveView("dashboard")}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${
            activeView === "dashboard" ? "text-violet-500" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Panel</span>
        </button>
        <button
          onClick={() => setActiveView("focus")}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${
            activeView === "focus" ? "text-violet-500" : "text-slate-500"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Enfoque</span>
        </button>
        <button
          onClick={() => setActiveView("calendar")}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${
            activeView === "calendar" ? "text-violet-500" : "text-slate-500"
          }`}
        >
          <CalendarRange className="w-5 h-5" />
          <span>Agenda</span>
        </button>
        <button
          onClick={() => setActiveView("achievements")}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${
            activeView === "achievements" ? "text-violet-500" : "text-slate-500"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Senda</span>
        </button>
        <button
          onClick={() => setActiveView("notes")}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${
            activeView === "notes" ? "text-violet-500" : "text-slate-500"
          }`}
        >
          <StickyNote className="w-5 h-5" />
          <span>Notas</span>
        </button>
      </div>

      {/* Background global indicators for nice layout touch */}
      <div className="fixed bottom-3 right-5 hidden md:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-500 z-50 backdrop-blur">
        <span>Flow Mode: Activo</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      </>
      ) : null}

    </div>
  );
}
