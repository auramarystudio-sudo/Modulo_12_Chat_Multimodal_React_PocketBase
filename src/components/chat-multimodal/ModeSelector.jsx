// Selector de Modo del Chat - Optimizado para móvil
// Botones grandes y táctiles

import { Sparkles, MessageSquare, Image, Video, Eye } from 'lucide-react';

const MODOS = [
  { id: 'auto', nombre: 'Auto', emoji: '✨', icono: Sparkles, color: 'cyan' },
  { id: 'texto', nombre: 'Texto', emoji: '💬', icono: MessageSquare, color: 'blue' },
  { id: 'imagen', nombre: 'Imagen', emoji: '🎨', icono: Image, color: 'pink' },
  { id: 'video', nombre: 'Video', emoji: '🎬', icono: Video, color: 'orange' },
  { id: 'analisis', nombre: 'Análisis', emoji: '🖼️', icono: Eye, color: 'green' },
];

export default function ModeSelector({ modoActual, onModoChange, modosPermitidos = null }) {
  const modosFiltrados = modosPermitidos 
    ? MODOS.filter(m => m.id === 'auto' || modosPermitidos.includes(m.id))
    : MODOS;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-hide">
      {modosFiltrados.map((modo) => {
        const activo = modoActual === modo.id;
        
        return (
          <button
            key={modo.id}
            onClick={() => onModoChange(modo.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap active:scale-95
              ${activo 
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'bg-slate-800/30 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }
            `}
          >
            <span className="text-sm">{modo.emoji}</span>
            <span className="hidden sm:inline">{modo.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
