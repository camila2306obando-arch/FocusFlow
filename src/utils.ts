import { Category, Priority } from "./types";

// Dynamic greeting creator based on time of day and self-compassion
export function getFriendlyGreeting(hour: number = new Date().getHours()): { greeting: string; subheading: string } {
  if (hour >= 6 && hour < 12) {
    return {
      greeting: "¡Buenos días!",
      subheading: "Un nuevo día para avanzar a tu propio ritmo, paso a pasito.",
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      greeting: "¡Buenas tardes!",
      subheading: "Recuerda respirar hondo. Tu esfuerzo ya es valioso.",
    };
  } else {
    return {
      greeting: "¡Buenas noches!",
      subheading: "Es momento de relajar la mente y celebrar lo que lograste hoy.",
    };
  }
}

// Low-pressure ADHD-focus reminders
export const MOTIVATIONAL_CARDS = [
  {
    theme: "Enfoque Amable",
    quote: "La parte más difícil de cualquier tarea es empezar durante tan solo 2 minutos. Si lo haces, ¡ya habrás ganado!",
  },
  {
    theme: "Auto-compasión",
    quote: "No necesitas terminar todo hoy. El progreso imperfecto sigue siendo un progreso asombroso.",
  },
  {
    theme: "Mente en Calma",
    quote: "Tu valor no se mide por tu productividad. Tómate un respiro, haz una micro-cosa a la vez.",
  },
  {
    theme: "Control del Caos",
    quote: "¿Sientes sobrecarga cognitiva? Prueba la función de 'Dividir en pasos' y haz solo el primero.",
  },
  {
    theme: "Pequeñas Victorias",
    quote: "Completar una pequeña tarea libera dopamina saludable. ¡A por ese siguiente micro-hito!",
  }
];

// Color palette mapping based on user requested: fondo: slate-900, tarjetas: slate-800, text: slate-100, etc.
export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; border: string; accent: string; dot: string; label: string }> = {
  Estudios: {
    bg: "bg-indigo-950/40",
    text: "text-indigo-200",
    border: "border-indigo-500/20",
    accent: "bg-indigo-500",
    dot: "bg-indigo-400",
    label: "📚 Estudios"
  },
  Trabajo: {
    bg: "bg-sky-950/40",
    text: "text-sky-200",
    border: "border-sky-500/20",
    accent: "bg-sky-500",
    dot: "bg-sky-400",
    label: "💼 Trabajo"
  },
  Personal: {
    bg: "bg-fuchsia-950/40",
    text: "text-fuchsia-200",
    border: "border-fuchsia-500/20",
    accent: "bg-fuchsia-500",
    dot: "bg-fuchsia-400",
    label: "✨ Personal"
  },
  Hogar: {
    bg: "bg-emerald-950/40",
    text: "text-emerald-200",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500",
    dot: "bg-emerald-400",
    label: "🏠 Hogar"
  },
  Salud: {
    bg: "bg-rose-950/40",
    text: "text-rose-200",
    border: "border-rose-500/20",
    accent: "bg-rose-500",
    dot: "bg-rose-400",
    label: "❤️ Salud"
  },
  Ocio: {
    bg: "bg-amber-950/40",
    text: "text-amber-200",
    border: "border-amber-500/20",
    accent: "bg-amber-500",
    dot: "bg-amber-400",
    label: "🎮 Ocio"
  }
};

export const PRIORITY_STYLES: Record<Priority, { label: string; text: string; bg: string; border: string }> = {
  Alta: {
    label: "Prioridad Alta",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
  Media: {
    label: "Prioridad Media",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  Baja: {
    label: "Prioridad Baja",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
};

// Calculate XP needed for next level (100 XP per level is extremely satisfying and fast)
export const XP_PER_LEVEL = 100;

export function getLevelProgress(xp: number): { percent: number; currentXP: number; maxXP: number } {
  const currentXP = xp % XP_PER_LEVEL;
  return {
    percent: currentXP,
    currentXP,
    maxXP: XP_PER_LEVEL,
  };
}

// Streaks helper
export function updateStreak(lastActive: string | undefined, currentStreak: number): { newStreak: number; newDate: string } {
  const todayStr = new Date().toISOString().split("T")[0];
  if (!lastActive) {
    return { newStreak: 1, newDate: todayStr };
  }

  const today = new Date(todayStr);
  const last = new Date(lastActive);
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { newStreak: currentStreak, newDate: lastActive }; // already active today
  } else if (diffDays === 1) {
    return { newStreak: currentStreak + 1, newDate: todayStr }; // consecutive days
  } else {
    return { newStreak: 1, newDate: todayStr }; // streak broken, reset to 1
  }
}
