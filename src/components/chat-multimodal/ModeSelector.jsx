// Selector de Modo del Chat
// Permite elegir entre Auto, Texto, Imagen, Video, Análisis

import { Sparkles, MessageSquare, Image, Video, Eye } from 'lucide-react';

const MODOS = [
  { id: 'auto', nombre: 'Auto', icono: Sparkles, color: 'from-cyan-500 to-purple-500' },
  { id: 'texto', nombre: 'Texto', icono: MessageSquare, color: 'from-blue-500 to-cyan-500' },
  { id: 'imagen', nombre: 'Imagen', icono: Image, color: 'from-pink-500 to-purple-500' },
  { id: 'video', nombre: 'Video', icono: Video, color: 'from-orange-500 to-red-500' },
  { id: 'analisis', nombre: 'Análisis', icono: Eye, color: 'from-green-500 to-emerald-500' },
];

export default function ModeSelector({ modoActual, onModoChange, modosPermitidos = null }) {
  const modosFiltrados = modosPermitidos 
    ? MODOS.filter(m => m.id === 'auto' || modosPermitidos.includes(m.id))
    : MODOS;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 px-1 scrollbar-hide">
      {modosFiltrados.map((modo) => {
        const Icono = modo.icono;
        const activo = modoActual === modo.id;
        
        return (
          <button
            key={modo.id}
            onClick={() => onModoChange(modo.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap
              ${activo 
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'bg-slate-800/30 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }
            `}
            title={modo.nombre}
          >
            <Icono className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{modo.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
