// Página de administración del Chat
// Ruta: /chat-admin
// Gestión de tokens, estadísticas, configuración global

import { useState } from 'react';
import { 
  Shield, Key, Users, BarChart3, Settings, 
  Plus, Trash2, Copy, Check, ArrowLeft, 
  Activity, Clock, MessageSquare 
} from 'lucide-react';

export default function ChatAdmin() {
  const [tokens, setTokens] = useState([]);
  const [estadisticas] = useState({
    totalSesiones: 0,
    totalMensajes: 0,
    totalTokens: 0,
    sesionesActivas: 0
  });
  const [nuevoToken, setNuevoToken] = useState({ nombre: '', descripcion: '', modos: ['texto', 'imagen', 'video', 'analisis'] });
  const [copiado, setCopiado] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  const generarTokenString = () => {
    return 'chat_' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleCrearToken = () => {
    if (!nuevoToken.nombre.trim()) return;
    
    const token = {
      id: Date.now(),
      token: generarTokenString(),
      nombre: nuevoToken.nombre,
      descripcion: nuevoToken.descripcion,
      activo: true,
      modos_permitidos: nuevoToken.modos,
      usos_actuales: 0,
      max_usos: null,
      creado_en: new Date().toISOString()
    };
    
    setTokens(prev => [...prev, token]);
    setNuevoToken({ nombre: '', descripcion: '', modos: ['texto', 'imagen', 'video', 'analisis'] });
  };

  const handleEliminarToken = (id) => {
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  const handleCopiar = (text) => {
    navigator.clipboard.writeText(text);
    setCopiado(text);
    setTimeout(() => setCopiado(null), 2000);
  };

  const toggleModo = (modo) => {
    setNuevoToken(prev => ({
      ...prev,
      modos: prev.modos.includes(modo) 
        ? prev.modos.filter(m => m !== modo)
        : [...prev.modos, modo]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Admin Chat Multimodal
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {['dashboard', 'tokens', 'stats'].map(v => (
              <button
                key={v}
                onClick={() => setVistaActiva(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  vistaActiva === v 
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {v === 'dashboard' ? '📊 Dashboard' : v === 'tokens' ? '🔑 Tokens' : '📈 Stats'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {vistaActiva === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={MessageSquare} label="Sesiones" value={estadisticas.totalSesiones} color="cyan" />
              <StatCard icon={Activity} label="Mensajes" value={estadisticas.totalMensajes} color="purple" />
              <StatCard icon={Key} label="Tokens" value={tokens.length} color="green" />
              <StatCard icon={Users} label="Activas" value={estadisticas.sesionesActivas} color="orange" />
            </div>

            {/* Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Panel de Administración
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p>Desde aquí puedes gestionar los tokens de acceso al chat multimodal.</p>
                <p>Los tokens permiten compartir el acceso al chat con otros dispositivos de forma segura.</p>
                <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <p className="text-xs text-slate-400 mb-2">Servicios configurados:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs">Ollama (127.0.0.1:11434)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs">A1111 (127.0.0.1:7860)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs">ComfyUI (127.0.0.1:8188)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs">PocketBase (127.0.0.1:8090)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestión de Tokens */}
        {vistaActiva === 'tokens' && (
          <div className="space-y-6 animate-fade-in">
            {/* Crear token */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Crear nuevo token
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Nombre</label>
                  <input
                    type="text"
                    value={nuevoToken.nombre}
                    onChange={(e) => setNuevoToken(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Mi móvil, Tablet oficina..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Descripción (opcional)</label>
                  <input
                    type="text"
                    value={nuevoToken.descripcion}
                    onChange={(e) => setNuevoToken(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción del token..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Modos permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {['texto', 'imagen', 'video', 'analisis'].map(modo => (
                      <button
                        key={modo}
                        onClick={() => toggleModo(modo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          nuevoToken.modos.includes(modo)
                            ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'
                        }`}
                      >
                        {modo === 'texto' ? '💬' : modo === 'imagen' ? '🎨' : modo === 'video' ? '🎬' : '🖼️'} {modo}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCrearToken}
                  disabled={!nuevoToken.nombre.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  Generar Token
                </button>
              </div>
            </div>

            {/* Lista de tokens */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-4">
                Tokens activos ({tokens.length})
              </h2>
              
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No hay tokens creados</p>
                  <p className="text-xs text-slate-600 mt-1">Crea uno para compartir el acceso</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map(t => (
                    <div key={t.id} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{t.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-green-950/50 text-green-400 border border-green-800/30">
                            Activo
                          </span>
                          <button
                            onClick={() => handleEliminarToken(t.id)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="flex-1 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded font-mono truncate">
                          {t.token}
                        </code>
                        <button
                          onClick={() => handleCopiar(t.token)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50 transition"
                        >
                          {copiado === t.token ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {t.descripcion && <span>{t.descripcion}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.creado_en).toLocaleDateString('es')}
                        </span>
                        <span>{t.usos_actuales} usos</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {vistaActiva === 'stats' && (
          <div className="animate-fade-in">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Estadísticas
              </h2>
              <p className="text-sm text-slate-400">
                Las estadísticas detalladas estarán disponibles cuando PocketBase esté conectado.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">0</p>
                  <p className="text-xs text-slate-500 mt-1">Mensajes hoy</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">0</p>
                  <p className="text-xs text-slate-500 mt-1">Imágenes generadas</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">0</p>
                  <p className="text-xs text-slate-500 mt-1">Análisis realizados</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-400">0</p>
                  <p className="text-xs text-slate-500 mt-1">Videos generados</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Card de estadística
 */
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    cyan: 'from-cyan-600/20 to-cyan-900/20 border-cyan-800/30 text-cyan-400',
    purple: 'from-purple-600/20 to-purple-900/20 border-purple-800/30 text-purple-400',
    green: 'from-green-600/20 to-green-900/20 border-green-800/30 text-green-400',
    orange: 'from-orange-600/20 to-orange-900/20 border-orange-800/30 text-orange-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <Icon className={`w-5 h-5 ${colors[color].split(' ').pop()} mb-2`} />
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
