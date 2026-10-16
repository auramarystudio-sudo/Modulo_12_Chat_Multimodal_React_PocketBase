// Componente de mensaje con imagen generada
// Muestra la imagen, metadata y acciones

import { useState } from 'react';
import { Download, Heart, RefreshCw, Copy, Maximize2 } from 'lucide-react';
import MessageActions from './MessageActions';

export default function ImageMessage({ mensaje, onAction }) {
  const [expandida, setExpandida] = useState(false);
  const { contenido, imagen_base64, parametros, tiempo_generacion, modelo_usado } = mensaje;

  const handleDownload = () => {
    if (!imagen_base64) return;
    const link = document.createElement('a');
    link.href = imagen_base64;
    link.download = `chat-ia-${Date.now()}.png`;
    link.click();
  };

  const handleCopyPrompt = () => {
    // Extraer prompt del contenido
    const match = contenido.match(/prompt: "(.*?)"/i) || contenido.match(/"(.*?)"/);
    if (match) {
      navigator.clipboard.writeText(match[1]);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm overflow-hidden">
      {/* Imagen */}
      <div className="relative group">
        <img
          src={imagen_base64}
          alt="Imagen generada"
          className="w-full max-h-[400px] object-contain bg-slate-950/50 cursor-pointer"
          onClick={() => setExpandida(true)}
        />
        {/* Overlay con acciones rápidas */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setExpandida(true)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenido descriptivo */}
      <div className="p-4">
        <p className="text-sm text-slate-300 mb-3">{contenido}</p>

        {/* Metadata de parámetros */}
        {parametros && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {parametros.steps && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                Steps: {parametros.steps}
              </span>
            )}
            {parametros.cfg_scale && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                CFG: {parametros.cfg_scale}
              </span>
            )}
            {parametros.sampler && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                {parametros.sampler}
              </span>
            )}
            {parametros.seed !== undefined && parametros.seed !== -1 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                Seed: {parametros.seed}
              </span>
            )}
            {parametros.width && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                {parametros.width}×{parametros.height}
              </span>
            )}
          </div>
        )}

        {/* Acciones rápidas de imagen */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            title="Descargar"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          <button
            onClick={() => onAction?.('favorito', mensaje)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-pink-400 hover:bg-slate-800/50 transition"
            title="Favorito"
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Favorito</span>
          </button>
          <button
            onClick={() => onAction?.('regenerar', mensaje)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition"
            title="Regenerar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerar</span>
          </button>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-green-400 hover:bg-slate-800/50 transition"
            title="Copiar prompt"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prompt</span>
          </button>
        </div>

        {/* Tiempo de generación */}
        {tiempo_generacion && (
          <p className="text-xs text-slate-500 mt-2">
            Generado en {tiempo_generacion.toFixed(1)}s • {modelo_usado}
          </p>
        )}
      </div>

      {/* Modal de imagen expandida */}
      {expandida && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandida(false)}
        >
          <img
            src={imagen_base64}
            alt="Imagen generada"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            onClick={() => setExpandida(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
