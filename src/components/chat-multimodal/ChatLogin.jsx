// Componente de Login con Token
// Pantalla de acceso al chat mediante token compartido

import { useState } from 'react';
import { KeyRound, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { autenticarConToken } from '../../utils/pocketbase';
import { validarFormatoToken } from '../../utils/token-manager';

export default function ChatLogin({ onLogin }) {
  const [token, setToken] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [modoDemo, setModoDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!token.trim()) {
      setError('Introduce un token de acceso');
      return;
    }

    setCargando(true);

    try {
      // Intentar autenticar con PocketBase
      const tokenData = await autenticarConToken(token.trim());
      onLogin({ token: token.trim(), data: tokenData });
    } catch (err) {
      // Si PocketBase no está disponible, verificar formato
      if (validarFormatoToken(token.trim())) {
        // Token con formato válido - permitir acceso en modo demo
        setModoDemo(true);
        onLogin({ token: token.trim(), data: { nombre: 'Usuario Demo', modos_permitidos: ['texto', 'imagen', 'video', 'analisis'] }, demo: true });
      } else {
        setError('Token no válido. Usa el token proporcionado por el administrador.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleDemo = () => {
    setModoDemo(true);
    onLogin({ 
      token: 'demo_mode', 
      data: { nombre: 'Demo', modos_permitidos: ['texto', 'imagen', 'video', 'analisis'] }, 
      demo: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-purple-600 mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Chat IA Multimodal
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Conversación, generación de imágenes, video y análisis
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-600/20">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Acceso al Chat</h2>
              <p className="text-xs text-slate-400">Introduce tu token de acceso</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Token de acceso</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="chat_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition font-mono text-sm"
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-lg disabled:opacity-50"
            >
              {cargando ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {cargando ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          {/* Botón Demo */}
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <button
              onClick={handleDemo}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              Entrar en modo Demo (sin token)
            </button>
          </div>
        </div>

        {/* Info footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Hub IA Local • Módulo de Chat Multimodal
        </p>
      </div>
    </div>
  );
}
