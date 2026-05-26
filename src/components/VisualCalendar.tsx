import React, { useState, useEffect } from "react";
import { Clock, Calendar, ChevronRight, ChevronLeft, PlusCircle, Trash, Check, Move, Palette } from "lucide-react";
import { Task, Category, ThemeColor, ThemeBg } from "../types";
import { CATEGORY_STYLES } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface VisualCalendarProps {
  tasks: Task[];
  onAssignTimeBlock: (taskId: string, day: string | undefined, hour: string | undefined, color?: string) => void;
  onUpdateTaskColor?: (taskId: string, color: string) => void;
  onAddTaskQuick: (title: string, category: Category, priority: "Alta"|"Media"|"Baja", day: string, hour: string, color?: string) => void;
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

// Time blocking hours that matter to typical routines
const HOURS_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

const CUSTOM_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#94a3b8"
];

export default function VisualCalendar({ tasks, onAssignTimeBlock, onUpdateTaskColor, onAddTaskQuick, themeColor = "violet", themeBg = "blue" }: VisualCalendarProps) {
  const [activeTab, setActiveTab] = useState<"day" | "week">("day");
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 is today
  const [showAssignModal, setShowAssignModal] = useState<{ hour: string; day: string } | null>(null);
  
  // Custom Color state
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  // Add Escape key handler to close modal
  useEffect(() => {
    if (!showAssignModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAssignModal(null);
        setSelectedColor(undefined);
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
      simple: d.toISOString().split("T")[0],
      dayOfWeek: d.getDay() // 0 = Sun, 1 = Mon ...
    };
  };

  const currentDateObj = getOffsetDateString(selectedDayOffset);

  // Filter tasks that are scheduled on specified hour slot for the day
  const getTasksInSlot = (hour: string, dateSimple: string) => {
    return tasks.filter((t) => t.timeBlockHour === hour && t.timeBlockDay === dateSimple && !t.completed);
  };

  // List tasks that have NO time block associated yet
  const getUnassignedTasks = () => {
    return tasks.filter((t) => (!t.timeBlockHour || !t.timeBlockDay) && !t.completed);
  };

  const handleSelectTaskForSlot = (taskId: string, day: string, hour: string) => {
    onAssignTimeBlock(taskId, day, hour, selectedColor);
    setShowAssignModal(null);
    setSelectedColor(undefined);
  };

  const handleRemoveTaskFromSlot = (taskId: string) => {
    onAssignTimeBlock(taskId, undefined, undefined);
  };

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskCat, setQuickTaskCat] = useState<Category>("Estudios");

  const submitQuickTask = (day: string, hour: string) => {
    if (!quickTaskTitle.trim()) return;
    onAddTaskQuick(quickTaskTitle, quickTaskCat, "Media", day, hour, selectedColor);
    setQuickTaskTitle("");
    setShowAssignModal(null);
    setSelectedColor(undefined);
  };

  const changeTaskColor = (taskId: string, color: string) => {
    if (onUpdateTaskColor) onUpdateTaskColor(taskId, color);
  };

  // Week calculation
  // Let's create an array of 7 days starting from Monday of the current week offset
  const getDaysOfWeek = () => {
    const today = new Date();
    today.setDate(today.getDate() + selectedDayOffset);
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + distanceToMonday + i);
        weekDays.push({
            date: d,
            simple: d.toISOString().split("T")[0],
            label: d.toLocaleDateString("es-ES", { weekday: "short" }),
            dayNum: d.getDate()
        });
    }
    return weekDays;
  };
  
  const weekDaysArray = getDaysOfWeek();

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
            Vista Semanal
          </button>
        </div>
      </div>
      
      {/* Date Navigator */}
      <div className="flex justify-between items-center bg-slate-900/40 px-4 py-2 rounded-xl mb-4 border border-slate-700/20">
        <button
          onClick={() => setSelectedDayOffset((prev) => prev - (activeTab === "week" ? 7 : 1))}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold font-sans text-slate-200 uppercase tracking-wide">
          {activeTab === "day" ? (
             <>{selectedDayOffset === 0 ? "Hoy, " : selectedDayOffset === 1 ? "Mañana, " : ""}{currentDateObj.full}</>
          ) : (
             <>Semana del {weekDaysArray[0].dayNum} al {weekDaysArray[6].dayNum} de {weekDaysArray[6].date.toLocaleDateString("es-ES", { month: "long" })}</>
          )}
        </span>
        <button
          onClick={() => setSelectedDayOffset((prev) => prev + (activeTab === "week" ? 7 : 1))}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/30 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {activeTab === "day" ? (
        <div>
          <p className="text-xs text-slate-400 mb-5 text-center leading-normal italic">
            "Planificar en bloques reduce la fatiga mental de decidir constantemente qué hacer a continuación."
          </p>

          {/* Slots List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {HOURS_SLOTS.map((hour) => {
              const slotTasks = getTasksInSlot(hour, currentDateObj.simple);

              return (
                <div
                  key={hour}
                  className="group flex gap-3 h-auto min-h-[50px] items-start p-2 rounded-xl hover:bg-slate-700/15 border border-transparent hover:border-slate-700/25 transition-all"
                >
                  {/* Hour Indicator */}
                  <div className="w-14 text-right pr-2 select-none border-r border-slate-700/30 h-full flex flex-col justify-center shrink-0">
                    <span className="font-mono text-xs font-bold text-indigo-400">{hour}</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500">Block</span>
                  </div>

                  {/* Slot tasks container */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    {slotTasks.length > 0 ? (
                      slotTasks.map((task) => {
                        const style = CATEGORY_STYLES[task.category];
                        return (
                          <div
                            key={task.id}
                            className={`flex justify-between items-center px-3 py-2 rounded-lg border group/card relative ${task.color ? 'bg-opacity-10 text-slate-100' : style.bg + ' ' + style.text}`}
                            style={task.color ? { backgroundColor: `${task.color}30`, borderColor: `${task.color}80` } : { borderColor: 'rgba(255,255,255,0.1)' }}
                          >
                            <span className="truncate pr-4 leading-none font-medium flex items-center gap-1.5 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${task.color ? '' : style.dot}`} style={task.color ? { backgroundColor: task.color } : {}} />
                              <span className="truncate">{task.title}</span>
                            </span>
                            
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Color Picker Dropdown on Hover */}
                                <div className="relative flex items-center justify-center opacity-20 group-hover/card:opacity-100 transition-opacity">
                                    <Palette className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer peer" />
                                    <div className="hidden peer-hover:flex hover:flex absolute right-0 top-5 bg-slate-800 border border-slate-700 p-1.5 rounded-lg shadow-xl gap-1 z-20 w-[140px] flex-wrap justify-between">
                                        {CUSTOM_COLORS.map(c => (
                                            <button key={c} onClick={() => changeTaskColor(task.id, c)} className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                                        ))}
                                        <button onClick={() => changeTaskColor(task.id, "")} className="w-4 h-4 rounded-full border border-slate-500 bg-transparent flex items-center justify-center hover:scale-125 transition-transform">
                                            <span className="text-[8px]">X</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                  onClick={() => handleRemoveTaskFromSlot(task.id)}
                                  className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-all focus:outline-none opacity-20 group-hover/card:opacity-100"
                                  title="Remover de este bloque"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center py-2">
                        <button
                          onClick={() => setShowAssignModal({ hour: hour, day: currentDateObj.simple })}
                          className="opacity-40 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 hover:opacity-100 transition-all font-medium focus:outline-none bg-slate-900/30 px-2 py-1 rounded w-fit"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Añadir / Asignar</span>
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
        /* Weekly Calendar View */
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar pb-4 max-h-[500px]">
          <div className="min-w-[800px]">
            {/* Headers */}
            <div className="grid grid-cols-[50px_repeat(7,_1fr)] gap-2 mb-2 sticky top-0 bg-slate-800/90 z-10 py-2 backdrop-blur-sm">
                <div className="text-right pr-2 text-[10px] font-mono text-slate-500 uppercase flex flex-col justify-end">Hora</div>
                {weekDaysArray.map((dayObj) => (
                    <div key={dayObj.simple} className="text-center pb-2 border-b border-slate-700/50">
                        <span className="text-xs font-bold font-sans text-slate-200 capitalize block">{dayObj.label}</span>
                        <span className={`text-[10px] font-mono font-bold ${dayObj.simple === getOffsetDateString(0).simple ? "bg-indigo-500 text-white px-1.5 py-0.5 rounded-full" : "text-slate-500"}`}>{dayObj.dayNum}</span>
                    </div>
                ))}
            </div>
            
            {/* Hour Rows */}
            <div className="space-y-2">
              {HOURS_SLOTS.map(hour => (
                <div key={hour} className="grid grid-cols-[50px_repeat(7,_1fr)] gap-2 group">
                    <div className="text-right pr-2 text-[10px] font-mono text-indigo-400/70 py-2 border-r border-slate-700/30 self-stretch flex items-center justify-end">
                      {hour}
                    </div>
                    {weekDaysArray.map((dayObj) => {
                      const slotTasks = getTasksInSlot(hour, dayObj.simple);
                      return (
                          <div key={`${dayObj.simple}-${hour}`} className="p-1 min-h-[60px] bg-slate-900/40 border border-slate-700/30 rounded-lg lg:hover:border-slate-700/70 transition-colors flex flex-col gap-1.5 relative group/slot shadow-inner">
                            {slotTasks.map(task => {
                                const style = CATEGORY_STYLES[task.category];
                                return (
                                    <div key={task.id} className="text-[10px] p-1.5 px-2 rounded-md border leading-tight shadow-sm cursor-default flex flex-col justify-start relative group/task" 
                                      style={task.color ? { backgroundColor: `${task.color}25`, borderLeftWidth: '3px', borderLeftColor: task.color, borderColor: `${task.color}40`, color: '#f1f5f9' } : { backgroundColor: 'var(--tw-colors-slate-900)', borderLeftWidth: '3px', borderLeftColor: 'rgba(255,255,255,0.4)', borderColor: 'transparent', color: style.text.replace('text-', '') }}
                                      title={task.title}>
                                          <span className="truncate w-full font-medium" style={task.color ? {} : { color: 'var(--tw-colors-slate-300)' }}>{task.title}</span>
                                          
                                          <div className="hidden group-hover/task:flex items-center absolute -top-1.5 -right-1.5 bg-slate-800 p-0.5 rounded-md shadow-xl border border-slate-700 z-10 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                              <button onClick={() => setShowAssignModal({ hour, day: dayObj.simple })} className="text-xs text-indigo-400 hover:text-indigo-300 p-1" title="Mover o cambiar">
                                                <Move className="w-3 h-3"/>
                                              </button>
                                              <button onClick={() => handleRemoveTaskFromSlot(task.id)} className="text-xs text-rose-400 hover:text-rose-300 p-1" title="Remover">
                                                <Trash className="w-3 h-3"/>
                                              </button>
                                          </div>
                                    </div>
                                )
                            })}
                            {slotTasks.length === 0 && (
                                <button onClick={() => setShowAssignModal({ hour: hour, day: dayObj.simple })} className="opacity-0 group-hover/slot:opacity-100 flex-1 flex items-center justify-center rounded border border-dashed border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-800/30 transition-all m-0.5">
                                    <PlusCircle className="w-3.5 h-3.5 text-slate-500"/>
                                </button>
                            )}
                          </div>
                      )
                    })}
                </div>
              ))}
            </div>
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
              className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              {/* Optional block color preview background */}
              {selectedColor && <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: selectedColor }} />}

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-base font-bold text-slate-100 flex flex-col">
                  Programar Bloque
                  <span className="text-indigo-400 font-mono font-bold text-xs uppercase mt-0.5">{showAssignModal.day} a las {showAssignModal.hour}</span>
                </h3>
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Color Picker for Assign Modal */}
              <div className="mb-5 relative z-10">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Color Personalizado:</label>
                <div className="flex gap-1.5 p-2 bg-slate-900/50 rounded-xl justify-between border border-slate-700/50">
                    <button onClick={() => setSelectedColor(undefined)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${!selectedColor ? 'border-indigo-400 text-indigo-400' : 'border-slate-600 text-slate-500'}`} title="Por Defecto (Categoría)">T</button>
                    {CUSTOM_COLORS.map(c => (
                        <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
              </div>

              {/* 1. Pick existing unassigned task */}
              <div className="mb-6 relative z-10">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Elegir tarea existente:
                </label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {getUnassignedTasks().length > 0 ? (
                    getUnassignedTasks().map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelectTaskForSlot(task.id, showAssignModal.day, showAssignModal.hour)}
                        className="w-full text-left bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 p-3 rounded-xl text-xs text-slate-200 hover:text-indigo-200 transition-all flex items-center justify-between group"
                      >
                        <span className="truncate pr-3">{task.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 hidden sm:block shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-1 text-center py-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                      No hay tareas libres.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Or create a quick mini task here */}
              <div className="border-t border-slate-700/50 pt-5 relative z-10">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Crear nueva en este bloque:
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ej. Tomar agua o Revisar correos..."
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  <div className="flex gap-2">
                    <select
                      value={quickTaskCat}
                      onChange={(e) => setQuickTaskCat(e.target.value as Category)}
                      className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="Estudios">📚 Estudios</option>
                      <option value="Trabajo">💼 Trabajo</option>
                      <option value="Personal">✨ Personal</option>
                      <option value="Hogar">🏠 Hogar</option>
                      <option value="Salud">❤️ Salud</option>
                      <option value="Ocio">🎮 Ocio</option>
                    </select>

                    <button
                      onClick={() => submitQuickTask(showAssignModal.day, showAssignModal.hour)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-auto px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/20"
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
