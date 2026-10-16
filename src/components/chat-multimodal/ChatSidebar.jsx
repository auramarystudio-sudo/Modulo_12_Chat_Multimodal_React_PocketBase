// Sidebar de conversaciones
// Lista de sesiones de chat con opción de crear nueva

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Clock, ChevronLeft, Sparkles } from 'lucide-react';

export default function ChatSidebar({ sesiones, sesionActual, onSelectSesion, onNuevaSesion, onEliminarSesion, visible, onClose }) {
  if (!visible) return null;

  return (
    <>
      {/* Overlay para móvil */}
      <div 
        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 z-40 flex flex-col shadow-xl lg:relative lg:translate-x-0 animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Conversaciones
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition lg:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Botón nueva conversación */}
          <button
            onClick={onNuevaSesion}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </button>
        </div>

        {/* Lista de sesiones */}
        <div className="flex-1 overflow-y-auto p-2">
          {sesiones.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Sin conversaciones</p>
              <p className="text-xs text-slate-600 mt-1">Crea una para empezar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sesiones.map((sesion) => (
                <SesionItem
                  key={sesion.id}
                  sesion={sesion}
                  activa={sesionActual?.id === sesion.id}
                  onSelect={() => onSelectSesion(sesion)}
                  onEliminar={() => onEliminarSesion(sesion.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            Chat IA Multimodal • Hub Local
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Item individual de sesión
 */
function SesionItem({ sesion, activa, onSelect, onEliminar }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition ${
        activa 
          ? 'bg-cyan-600/10 border border-cyan-500/20' 
          : 'hover:bg-slate-800/50 border border-transparent'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activa ? 'text-cyan-400' : 'text-slate-500'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${activa ? 'text-slate-100' : 'text-slate-300'}`}>
          {sesion.titulo || 'Sin título'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">
            {sesion.total_mensajes || 0} msgs
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
      {showActions && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminar();
          }}
          className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
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
