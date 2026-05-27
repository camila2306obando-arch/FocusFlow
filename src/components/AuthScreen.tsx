import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, ChevronRight, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';

interface AuthScreenProps {
  appBg: any;
  appTheme: any;
}

export default function AuthScreen({ appBg, appTheme }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al entrar como invitado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl relative overflow-hidden backdrop-blur-xl ${
          appBg.isLight 
            ? 'bg-white/80 border-slate-200/60 shadow-slate-200/50' 
            : 'bg-slate-900/60 border-slate-700/50 shadow-black/50'
        }`}
      >
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${appTheme.gradientBorder}`} />

        <div className="text-center mb-8">
          <h2 className={`text-2xl font-extrabold mb-2 tracking-tight flex items-center justify-center gap-2 ${appBg.isLight ? 'text-slate-900' : 'text-white'}`}>
            Bienvenido a Focus<span className={appTheme.textLight}>Flow</span>
          </h2>
          <p className={`text-sm ${appBg.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {isLogin ? 'Inicia sesión para continuar organizando tu mente.' : 'Crea una cuenta para sincronizar tus metas.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${appBg.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`w-4 h-4 ${appBg.isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  appBg.isLight 
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white' 
                    : 'bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-900'
                }`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${appBg.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`w-4 h-4 ${appBg.isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  appBg.isLight 
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white' 
                    : 'bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              appBg.isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-slate-900 hover:bg-slate-200'
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <div className={`h-[1px] flex-1 ${appBg.isLight ? 'bg-slate-200' : 'bg-slate-700/50'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${appBg.isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            O continuar con
          </span>
          <div className={`h-[1px] flex-1 ${appBg.isLight ? 'bg-slate-200' : 'bg-slate-700/50'}`} />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className={`w-full h-11 rounded-xl flex items-center justify-center gap-3 transition-all font-medium border ${
              appBg.isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-200 hover:bg-slate-700/40'
            } disabled:opacity-50`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
          
          <button
            onClick={handleGuestAuth}
            disabled={loading}
            className={`w-full h-11 rounded-xl flex items-center justify-center gap-3 transition-all font-bold ${
              appBg.isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : appTheme.activeTab
            } disabled:opacity-50`}
          >
            <User className="w-4 h-4" />
            Entrar como Invitado
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-xs ${appBg.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`ml-1 font-bold transition-colors ${appBg.isLight ? 'text-indigo-600 hover:text-indigo-700' : appTheme.textLightHover}`}
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
