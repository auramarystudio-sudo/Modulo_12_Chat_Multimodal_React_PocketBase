// Menú de Conversaciones - Usa Portal para funcionar en cualquier contexto
// Funciona tanto standalone como dentro de contenedores con sidebar

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, MessageSquare, Trash2, Clock, X, 
  Key, LogOut, Sparkles
} from 'lucide-react';

export default function ConversationsMenu({ 
  sesiones, 
  sesionActual, 
  visible, 
  onClose,
  onSelectSesion, 
  onNuevaSesion, 
  onEliminarSesion,
  onTokens,
  onLogout 
}) {
  const [eliminandoId, setEliminandoId] = useState(null);

  if (!visible) return null;

  const handleEliminar = (id, e) => {
    e.stopPropagation();
    if (eliminandoId === id) {
      onEliminarSesion(id);
      setEliminandoId(null);
    } else {
      setEliminandoId(id);
      setTimeout(() => setEliminandoId(null), 3000);
    }
  };

  // Usar Portal para renderizar fuera del contenedor padre
  // Esto garantiza que funcione sin importar overflow/transform del padre
  const menuContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet (móvil) / Drawer (desktop) */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:inset-x-auto md:left-0 md:w-80 bg-slate-900/98 backdrop-blur-xl md:border-r border-t md:border-t-0 border-slate-800/50 z-[9999] flex flex-col shadow-2xl rounded-t-3xl md:rounded-t-none md:rounded-none animate-slide-up max-h-[90vh] md:max-h-full">
        
        {/* Handle para arrastrar (solo móvil) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-4 pt-3 pb-3 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Conversaciones
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Botón nueva conversación */}
          <button
            onClick={onNuevaSesion}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva conversación</span>
          </button>
        </div>

        {/* Lista de sesiones */}
        <div className="flex-1 overflow-y-auto p-3 overscroll-contain">
          {sesiones.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sin conversaciones</p>
              <p className="text-xs text-slate-600 mt-1">Crea una para empezar</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sesiones.map((sesion) => (
                <SesionItem
                  key={sesion.id}
                  sesion={sesion}
                  activa={sesionActual?.id === sesion.id}
                  eliminando={eliminandoId === sesion.id}
                  onSelect={() => onSelectSesion(sesion)}
                  onEliminar={(e) => handleEliminar(sesion.id, e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-3 border-t border-slate-800/50 space-y-2 pb-safe">
          <button
            onClick={onTokens}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          >
            <Key className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">Gestionar Tokens</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 hover:text-red-300 transition active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );

  // Renderizar mediante Portal al body
  return createPortal(menuContent, document.body);
}

/**
 * Item individual de sesión
 */
function SesionItem({ sesion, activa, eliminando, onSelect, onEliminar }) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition active:scale-98 ${
        activa 
          ? 'bg-cyan-600/15 border border-cyan-500/25' 
          : 'hover:bg-slate-800/50 active:bg-slate-800 border border-transparent'
      }`}
      onClick={onSelect}
    >
      {/* Icono */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        activa ? 'bg-cyan-600/20' : 'bg-slate-800/50'
      }`}>
        <MessageSquare className={`w-5 h-5 ${activa ? 'text-cyan-400' : 'text-slate-500'}`} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${activa ? 'text-slate-100' : 'text-slate-200'}`}>
          {sesion.titulo || 'Sin título'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">
            {sesion.total_mensajes || 0} mensajes
          </span>
          {sesion.ultima_actividad && (
            <span className="text-xs text-slate-600 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(sesion.ultima_actividad)}
            </span>
          )}
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={onEliminar}
        className={`p-2 rounded-lg transition active:scale-90 ${
          eliminando 
            ? 'bg-red-600 text-white' 
            : 'text-slate-500 hover:text-red-400 hover:bg-red-950/30'
        }`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Indicador de confirmación */}
      {eliminando && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 rounded-xl animate-fade-in">
          <span className="text-xs text-red-300 font-medium">Toca de nuevo para eliminar</span>
        </div>
      )}
    </div>
  );
}

/**
 * Formatea tiempo relativo
 */
function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'ahora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}
