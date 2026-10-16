// Indicador de progreso
// Muestra el progreso de generación de imagen/video

import { Loader2 } from 'lucide-react';

export default function ProgressIndicator({ activo, tipo, mensaje, progreso }) {
  if (!activo) return null;

  const getIcon = () => {
    switch (tipo) {
      case 'imagen': return '🎨';
      case 'video': return '🎬';
      case 'analisis': return '🖼️';
      case 'texto': return '💬';
      default: return '⏳';
    }
  };

  const getColor = () => {
    switch (tipo) {
      case 'imagen': return 'from-pink-500 to-purple-500';
      case 'video': return 'from-orange-500 to-red-500';
      case 'analisis': return 'from-green-500 to-emerald-500';
      case 'texto': return 'from-blue-500 to-cyan-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
      </div>
      <div className="flex-1">
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getIcon()}</span>
            <span className="text-sm text-slate-300">
              {mensaje || 'Procesando...'}
            </span>
          </div>
          
          {/* Barra de progreso */}
          {progreso !== undefined && progreso !== null && (
            <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(progreso, 100)}%` }}
              />
            </div>
          )}
          
          {/* Dots animados cuando no hay progreso */}
          {progreso === undefined && (
            <div className="flex items-center gap-1">
              <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
              <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
              <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
