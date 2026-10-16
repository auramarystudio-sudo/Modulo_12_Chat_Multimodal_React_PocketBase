// Botones de acción para mensajes
// Copiar, regenerar, favorito, etc.

import { useState } from 'react';
import { Copy, Check, RefreshCw, Heart, Trash2 } from 'lucide-react';

export default function MessageActions({ mensaje, onAction }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensaje.contenido || '');
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  // No mostrar acciones para mensajes de usuario o sistema
  if (mensaje.rol === 'usuario' || mensaje.tipo === 'sistema' || mensaje.tipo === 'texto_usuario') {
    return null;
  }

  return (
    <div className="flex items-center gap-1 mt-1 ml-1">
      {/* Copiar */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition"
        title="Copiar texto"
      >
        {copiado ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Regenerar */}
      <button
        onClick={() => onAction?.('regenerar', mensaje)}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition"
        title="Regenerar respuesta"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>

      {/* Favorito */}
      <button
        onClick={() => onAction?.('favorito', mensaje)}
        className={`p-1.5 rounded-md transition ${
          mensaje.favorito 
            ? 'text-pink-400 hover:text-pink-300' 
            : 'text-slate-500 hover:text-pink-400 hover:bg-slate-800/50'
        }`}
        title="Marcar como favorito"
      >
        <Heart className={`w-3.5 h-3.5 ${mensaje.favorito ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
