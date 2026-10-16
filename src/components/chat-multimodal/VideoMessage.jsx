// Componente de mensaje con video generado
// Muestra el video, metadata y acciones

import { Download, RefreshCw, Clock } from 'lucide-react';

export default function VideoMessage({ mensaje, onAction }) {
  const { contenido, video_url, video_base64, parametros, tiempo_generacion, modelo_usado } = mensaje;

  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm overflow-hidden">
      {/* Video */}
      <div className="relative bg-slate-950/50">
        {video_url ? (
          <video
            src={video_url}
            controls
            loop
            className="w-full max-h-[300px] object-contain"
          />
        ) : video_base64 ? (
          <video
            src={video_base64}
            controls
            loop
            className="w-full max-h-[300px] object-contain"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-sm text-slate-400">Video en simulación</p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <p className="text-sm text-slate-300 mb-3">{contenido}</p>

        {/* Metadata */}
        {parametros && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {parametros.frames && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                {parametros.frames} frames
              </span>
            )}
            {parametros.fps && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                {parametros.fps} FPS
              </span>
            )}
            {parametros.motion_bucket_id && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900/50 text-slate-400 border border-slate-700/30">
                Motion: {parametros.motion_bucket_id}
              </span>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
          {(video_url || video_base64) && (
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = video_url || video_base64;
                link.download = `chat-video-${Date.now()}.mp4`;
                link.click();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          )}
          <button
            onClick={() => onAction?.('regenerar', mensaje)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerar</span>
          </button>
        </div>

        {/* Tiempo */}
        {tiempo_generacion && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Generado en {tiempo_generacion.toFixed(1)}s • {modelo_usado}
          </p>
        )}
      </div>
    </div>
  );
}
