import React, { useState, useEffect, useRef } from "react";
import { ThemeColor, ThemeBg } from "../types";
import { Plus, X, List, ListOrdered, CheckSquare, Type, Bold, Italic, Save, Trash2, Edit3, Eye, FileText, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface NotesViewProps {
  themeColor?: ThemeColor;
  themeBg?: ThemeBg;
}

export default function NotesView({ themeColor = "violet", themeBg = "blue" }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);

  // Load notes
  useEffect(() => {
    try {
      const stored = localStorage.getItem("focusflow_notes");
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save notes
  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem("focusflow_notes", JSON.stringify(updated));
  };

  const activeThemeClass = `text-${themeColor}-400`;
  const activeBgClass = `bg-${themeColor}-500/20`;
  const activeBorderClass = `border-${themeColor}-500/50`;
  const activeGradient = `from-${themeColor}-500/20 to-${themeColor}-600/5`;

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Nueva Nota",
      content: "",
      updatedAt: Date.now(),
    };
    setActiveNote(newNote);
    setIsEditing(true);
    setWordCount(0);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;
    
    // Fallback title if empty
    const finalNote = {
      ...activeNote,
      title: activeNote.title.trim() === "" ? "Nota sin título" : activeNote.title
    };

    const existingIndex = notes.findIndex(n => n.id === finalNote.id);
    let updatedNotes = [...notes];
    if (existingIndex >= 0) {
      updatedNotes[existingIndex] = { ...finalNote, updatedAt: Date.now() };
    } else {
      updatedNotes = [finalNote, ...updatedNotes];
    }
    
    saveNotes(updatedNotes);
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNote?.id === id) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  const calculateWords = (text: string) => {
    const words = text.match(/\b[-?a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]+\b/g);
    return words ? words.length : 0;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNote) return;
    const text = e.target.value;
    const words = calculateWords(text);
    
    if (words <= 500) {
      setActiveNote({ ...activeNote, content: text });
      setWordCount(words);
    } else {
      if (text.length < activeNote.content.length) {
        setActiveNote({ ...activeNote, content: text });
        setWordCount(calculateWords(text));
      }
    }
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current || !activeNote) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    
    setActiveNote({ ...activeNote, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const closeActiveNote = () => {
    if (isEditing) {
      handleSaveNote();
    }
    setActiveNote(null);
  };

  return (
    <div className="h-full flex flex-col relative w-full">
      {/* Background Grid View Always Visible */}
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutGrid className={`w-5 h-5 ${activeThemeClass}`} />
            Mis Notas
          </h2>
          <button
            onClick={handleCreateNote}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-md text-slate-200 rounded-xl hover:bg-slate-700 transition border border-slate-700/50 hover:${activeBorderClass} shadow-lg shadow-black/20`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm hidden sm:inline">Nueva nota</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-y-auto custom-scrollbar pb-24 pr-1">
          {notes.map(note => (
            <motion.div
              layoutId={`note-${note.id}`}
              key={note.id}
              onClick={() => {
                setActiveNote(note);
                setIsEditing(false);
                setWordCount(calculateWords(note.content));
              }}
              className="aspect-square bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80 border border-slate-700/40 hover:border-slate-500/60 rounded-2xl p-3 cursor-pointer flex flex-col transition-all duration-300 group relative shadow-md hover:shadow-xl overflow-hidden hover:-translate-y-1"
            >
              {/* Decorative gentle gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${activeGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
              
              <div className="flex-1 flex items-center justify-center text-center">
                <h3 className="text-xs font-bold text-slate-200 leading-snug line-clamp-3 px-1 group-hover:text-white transition-colors">
                  {note.title || "Sin título"}
                </h3>
              </div>
              
              <button
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/30 hover:scale-110"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-[2rem] bg-slate-900/20 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center mb-4 shadow-lg">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-bold text-lg mb-1">Sin apuntes</p>
              <p className="text-slate-500 text-sm font-medium">Tus notas minimalistas aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Active Note Overlay (Glassmorphism Modal) */}
      <AnimatePresence>
        {activeNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pointer-events-none">
            {/* Backdrop click catcher */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 bg-black/40 pointer-events-auto"
              onClick={closeActiveNote}
            />

            <motion.div 
              layoutId={`note-${activeNote.id}`}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800/60 bg-slate-900/50">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                  readOnly={!isEditing}
                  className="bg-transparent text-xl font-extrabold text-white border-none outline-none focus:ring-0 flex-1 px-1 placeholder-slate-600 transition-all"
                  placeholder="Título de la nota"
                />
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-1 rounded-md bg-slate-800 ${wordCount >= 500 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {wordCount}/500
                  </span>
                  
                  {!isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(true)} className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 rounded-xl bg-slate-800/80 text-rose-400 hover:bg-rose-500/20 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition" title="Ver previa">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={handleSaveNote} className={`p-2 py-1.5 rounded-xl ${activeBgClass} ${activeThemeClass} border border-transparent hover:${activeBorderClass} transition flex items-center gap-1.5 font-bold text-xs px-3 shadow-lg shadow-black/20`} title="Guardar">
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </button>
                    </>
                  )}
                  
                  <div className="w-px h-6 bg-slate-700/50 mx-1" />
                  
                  <button onClick={closeActiveNote} className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Editor / Preview Area */}
              <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-900/20">
                {isEditing && (
                  <div className="flex items-center gap-1.5 p-2 px-6 bg-slate-900/80 border-b border-slate-800/60 overflow-x-auto shadow-sm">
                    <button onClick={() => insertFormatting("**", "**")} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition" title="Negrita">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertFormatting("*", "*")} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition" title="Cursiva">
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-2" />
                    <button onClick={() => insertFormatting("\n- ")} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition" title="Lista de puntos">
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertFormatting("\n1. ")} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition" title="Lista numerada">
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertFormatting("\n- [ ] ")} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition" title="Lista interactiva (Checklist)">
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  {isEditing ? (
                    <textarea
                      ref={textareaRef}
                      value={activeNote.content}
                      onChange={handleContentChange}
                      className="w-full h-full min-h-[300px] p-6 lg:p-8 bg-transparent text-slate-200 placeholder-slate-600 border-none outline-none resize-none focus:ring-0 leading-relaxed font-sans text-sm sm:text-base break-words"
                      placeholder="Escribe tus apuntes aquí... (Soporta Markdown)"
                    />
                  ) : (
                    <div className="p-6 lg:p-8 text-slate-200 prose prose-invert max-w-none 
                      prose-p:leading-relaxed prose-li:my-1 prose-ul:my-2 prose-headings:font-bold 
                      prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-headings:text-slate-100 prose-strong:text-white break-words overflow-x-auto overflow-y-hidden custom-scrollbar">
                      {activeNote.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeNote.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                          <p className="text-slate-500 italic mb-4">La nota está vacía.</p>
                          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:text-white font-bold text-sm transition">
                            Empezar a escribir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
