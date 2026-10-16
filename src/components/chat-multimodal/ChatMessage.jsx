// Componente de burbuja de mensaje
// Renderiza diferentes tipos: texto, imagen, video, análisis, error, sistema

import { User, Bot, AlertTriangle, Info, Clock, Cpu } from 'lucide-react';
import MessageActions from './MessageActions';
import ImageMessage from './ImageMessage';
import VideoMessage from './VideoMessage';

export default function ChatMessage({ mensaje, onAction }) {
  const { tipo, contenido, rol } = mensaje;

  // Mensaje de sistema
  if (tipo === 'sistema') {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/30 border border-slate-700/30">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">{contenido}</span>
        </div>
      </div>
    );
  }

  // Mensaje de error
  if (tipo === 'error') {
    return (
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-950/50 border border-red-800/30 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 max-w-[85%]">
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl rounded-tl-sm p-4">
            <p className="text-sm text-red-200 whitespace-pre-wrap">{contenido}</p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => onAction?.('reintentar', mensaje)}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mensaje de usuario
  if (tipo === 'texto_usuario' || rol === 'usuario') {
    return (
      <div className="flex gap-3 mb-4 justify-end animate-fade-in">
        <div className="max-w-[85%]">
          <div className="bg-cyan-600/20 border border-cyan-500/20 rounded-2xl rounded-tr-sm p-4">
            <p className="text-sm text-slate-100 whitespace-pre-wrap">{contenido}</p>
          </div>
          {/* Imagen adjunta del usuario */}
          {mensaje.imagen_adjunta && (
            <div className="mt-2">
              <img 
                src={mensaje.imagen_adjunta} 
                alt="Adjunto" 
                className="max-w-[200px] rounded-lg border border-slate-700/50"
              />
            </div>
          )}
          <div className="flex justify-end mt-1">
            <span className="text-xs text-slate-500">Tú</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
      </div>
    );
  }

  // Mensaje de imagen generada
  if (tipo === 'imagen_generada') {
    return (
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-800/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <ImageMessage mensaje={mensaje} onAction={onAction} />
        </div>
      </div>
    );
  }

  // Mensaje de video generado
  if (tipo === 'video_generado') {
    return (
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-950/50 border border-orange-800/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <VideoMessage mensaje={mensaje} onAction={onAction} />
        </div>
      </div>
    );
  }

  // Mensaje de análisis de imagen
  if (tipo === 'analisis_imagen') {
    return (
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-950/50 border border-green-800/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm p-4">
            {/* Imagen analizada */}
            {mensaje.imagen_adjunta && (
              <div className="mb-3">
                <img 
                  src={mensaje.imagen_adjunta} 
                  alt="Analizada" 
                  className="max-w-[200px] rounded-lg border border-slate-700/50"
                />
              </div>
            )}
            <div className="text-sm text-slate-200 whitespace-pre-wrap">
              {contenido}
            </div>
            {/* Metadata */}
            <div className="mt-3 flex flex-wrap gap-2">
              {mensaje.modelo_usado && (
                <span className="text-xs px-2 py-1 rounded-md bg-green-950/50 text-green-300 border border-green-800/30">
                  {mensaje.modelo_usado}
                </span>
              )}
              {mensaje.tiempo_respuesta_seg && (
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mensaje.tiempo_respuesta_seg.toFixed(1)}s
                </span>
              )}
            </div>
          </div>
          <MessageActions mensaje={mensaje} onAction={onAction} />
        </div>
      </div>
    );
  }

  // Mensaje de texto IA (por defecto)
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-800/30 flex items-center justify-center">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm p-4">
          <div className="text-sm text-slate-200 whitespace-pre-wrap">
            {contenido}
          </div>
          {/* Metadata */}
          <div className="mt-2 flex flex-wrap gap-2">
            {mensaje.modelo_usado && mensaje.modelo_usado !== 'simulación' && (
              <span className="text-xs px-2 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {mensaje.modelo_usado}
              </span>
            )}
            {mensaje.modelo_usado === 'simulación' && (
              <span className="text-xs px-2 py-1 rounded-md bg-amber-950/50 text-amber-300 border border-amber-800/30">
                ⚠️ Simulación
              </span>
            )}
            {mensaje.tiempo_respuesta_seg && (
              <span className="text-xs px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {mensaje.tiempo_respuesta_seg.toFixed(1)}s
              </span>
            )}
          </div>
        </div>
        <MessageActions mensaje={mensaje} onAction={onAction} />
      </div>
    </div>
  );
}
