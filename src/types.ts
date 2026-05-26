export type Priority = "Alta" | "Media" | "Baja";

export type Category = "Estudios" | "Trabajo" | "Personal" | "Hogar" | "Salud" | "Ocio";

export type ThemeColor = "violet" | "emerald" | "amber" | "rose" | "sky" | "pink" | "white" | "black" | "yellow";

export type ThemeBg = "blue" | "black" | "white";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  deadline?: string; // YYYY-MM-DD
  subtasks: SubTask[];
  motivation?: string;
  createdAt: string;
  timeBlockHour?: string; // e.g. "09:00", "14:00" etc (to map to time blocking slots)
  timeBlockDay?: string; // "lun", "mar", "mie", "jue", "vie", "sab", "dom"
  color?: string; // custom color for the task
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD to track streak
  totalTasksCompleted: number;
  totalFocusSessions: number;
  totalFocusMinutes: number;
}

export interface MotivationalMessage {
  id: string;
  text: string;
  author: string;
}

export type FocusModeType = "pomodoro" | "flowtime";

export interface FocusSession {
  isActive: boolean;
  type: FocusModeType;
  duration: number; // in seconds
  timeLeft: number; // in seconds
  isPaused: boolean;
  associatedTaskId?: string;
}
