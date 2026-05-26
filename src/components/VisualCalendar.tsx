import React, { useState, useEffect } from "react";
import { Clock, Calendar, ChevronRight, ChevronLeft, PlusCircle, Trash, Check, Move } from "lucide-react";
import { Task, Category, ThemeColor, ThemeBg } from "../types";
import { CATEGORY_STYLES } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface VisualCalendarProps {
  tasks: Task[];
  onAssignTimeBlock: (taskId: string, hour: string | undefined) => void;
  onAddTaskQuick: (title: string, category: Category, priority: "Alta"|"Media"|"Baja", hour: string) => void;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

// Time blocking hours that matter to typical routines
const HOURS_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

const WEEK_DAYS = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miér" },
  { key: "jue", label: "Juev" },
  { key: "vie", label: "Vier" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" }
];

export default function VisualCalendar({ tasks, onAssignTimeBlock, onAddTaskQuick, themeColor = "violet", themeBg = "blue" }: VisualCalendarProps) {
  const [activeTab, setActiveTab] = useState<"day" | "week">("day");
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 is today
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // holds hour slot being assigned

  // Add Escape key handler to close modal
  useEffect(() => {
    if (!showAssignModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAssignModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAssignModal]);

  // Get current date string offset
  const getOffsetDateString = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      full: d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
      short: d.toLocaleDateString("es-ES", { weekday: "short" }),
      simple: d.toISOString().split("T")[0]
    };
  };

  const currentDateObj = getOffsetDateString(selectedDayOffset);

  // Filter tasks that are scheduled on specified hour slot for the day
  const getTasksInSlot = (hour: string) => {
    return tasks.filter((t) => t.timeBlockHour === hour && !t.completed);
  };

  // List tasks that have NO time block associated yet
  const getUnassignedTasks = () => {
    return tasks.filter((t) => !t.timeBlockHour && !t.completed);
  };

  const handleSelectTaskForSlot = (taskId: string, hour: string) => {
    onAssignTimeBlock(taskId, hour);
    setShowAssignModal(null);
  };

  const handleRemoveTaskFromSlot = (taskId: string) => {
    onAssignTimeBlock(taskId, undefined);
  };

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskCat, setQuickTaskCat] = useState<Category>("Estudios");

  const submitQuickTask = (hour: string) => {
    if (!quickTaskTitle.trim()) return;
    onAddTaskQuick(quickTaskTitle, quickTaskCat, "Media", hour);
    setQuickTaskTitle("");
    setShowAssignModal(null);
  };

  return (
    <div className="bg-slate-800/65 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg w-full" id="visual-calendar-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase font-mono text-indigo-400">Time Blocking Visual</span>
          <h2 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Maquetación del Tiempo
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700/50 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("day")}
            className={`flex-1 sm:flex-none text-xs px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "day" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Vista Diaria
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`flex-1 sm:flex-none text-xs px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "week" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Carga Semanal
          </button>
        </div>
      </div>

      {activeTab === "day" ? (
        <div>
          {/* Day Navigator */}
          <div className="flex justify-between items-center bg-slate-900/40 px-4 py-2 rounded-xl mb-4 border border-slate-700/20">
            <button
              onClick={() => setSelectedDayOffset((prev) => prev - 1)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold font-sans text-slate-200 uppercase tracking-wide">
              {selectedDayOffset === 0 ? "Hoy, " : selectedDayOffset === 1 ? "Mañana, " : ""}
              {currentDateObj.full}
            </span>
            <button
              onClick={() => setSelectedDayOffset((prev) => prev + 1)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-5 text-center leading-normal italic">
            "Planificar en bloques reduce la fatiga mental de decidir constantemente qué hacer a continuación."
          </p>

          {/* Slots List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {HOURS_SLOTS.map((hour) => {
              const slotTasks = getTasksInSlot(hour);

              return (
                <div
                  key={hour}
                  className="group flex gap-3 h-auto min-h-[50px] items-start p-2 rounded-xl hover:bg-slate-700/15 border border-transparent hover:border-slate-700/25 transition-all"
                >
                  {/* Hour Indicator */}
                  <div className="w-14 text-right pr-2 select-none border-r border-slate-700/30 h-full flex flex-col justify-center">
                    <span className="font-mono text-xs font-bold text-indigo-400">{hour}</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500">Block</span>
                  </div>

                  {/* Slot tasks container */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    {slotTasks.length > 0 ? (
                      slotTasks.map((task) => {
                        const style = CATEGORY_STYLES[task.category];
                        return (
                          <div
                            key={task.id}
                            className={`flex justify-between items-center px-3 py-2 rounded-lg ${style.bg} border ${style.border} text-xs font-medium ${style.text} group/card relative`}
                          >
                            <span className="truncate pr-4 leading-none font-medium flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {task.title}
                            </span>
                            <button
                              onClick={() => handleRemoveTaskFromSlot(task.id)}
                              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-all focus:outline-none"
                              title="Remover de este bloque"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center">
                        <button
                          onClick={() => setShowAssignModal(hour)}
                          className="opacity-20 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 hover:opacity-100 transition-all font-medium focus:outline-none"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Asignar tarea a este bloque</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly density review block */
        <div>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Distribución general de todas tus tareas pendientes por categorías, facilitando una vista panorámica equilibrada para no agotarte mentalmente.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(CATEGORY_STYLES).map((catName) => {
              const catTasksNum = tasks.filter((t) => t.category === catName && !t.completed).length;
              const catTasksComp = tasks.filter((t) => t.category === catName && t.completed).length;
              const style = CATEGORY_STYLES[catName as Category];

              return (
                <div
                  key={catName}
                  className={`p-3.5 rounded-xl border ${style.border} ${style.bg} flex flex-col justify-between`}
                >
                  <span className="text-xs font-bold leading-none mb-2 block">{style.label}</span>
                  <div>
                    <span className="text-2xl font-black block tracking-tight">{catTasksNum}</span>
                    <span className="text-[10px] text-slate-400 leading-none">
                      {catTasksComp} completadas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Assign Task Selection Overlay Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-200">
                  Bloquear Hora: <span className="text-indigo-400 font-mono font-bold">{showAssignModal}</span>
                </h3>
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {/* 1. Pick existing unassigned task */}
              <div className="mb-5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5">
                  Elegir tarea existente:
                </label>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {getUnassignedTasks().length > 0 ? (
                    getUnassignedTasks().map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelectTaskForSlot(task.id, showAssignModal)}
                        className="w-full text-left bg-slate-900/50 hover:bg-slate-900 border border-slate-700/40 p-2.5 rounded-xl text-xs text-slate-200 hover:text-indigo-300 transition-all flex items-center justify-between"
                      >
                        <span className="truncate">{task.title}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-1 text-center py-2 bg-slate-900/20 rounded-xl">
                      No hay tareas pendientes sin programar
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Or create a quick mini task here */}
              <div className="border-t border-slate-700/50 pt-3.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                  Crear nueva tarea en este bloque:
                </label>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Ej. Tomar agua o Revisar correos..."
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={quickTaskCat}
                      onChange={(e) => setQuickTaskCat(e.target.value as Category)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="Estudios">📚 Estudios</option>
                      <option value="Trabajo">💼 Trabajo</option>
                      <option value="Personal">✨ Personal</option>
                      <option value="Hogar">🏠 Hogar</option>
                      <option value="Salud">❤️ Salud</option>
                      <option value="Ocio">🎮 Ocio</option>
                    </select>

                    <button
                      onClick={() => submitQuickTask(showAssignModal)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold leading-none h-auto px-4 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Crear</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
