// Galería rápida de imágenes generadas
// Muestra miniaturas de las últimas imágenes para reutilizar

import { Image, X } from 'lucide-react';

export default function QuickGallery({ imagenes, visible, onClose, onSelect }) {
  if (!visible || imagenes.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 z-50 max-h-[50vh] flex flex-col animate-fade-in rounded-t-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-bold text-slate-200">Galería rápida</h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400">
              {imagenes.length} imágenes
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid de imágenes */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {imagenes.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(img);
                  onClose();
                }}
                className="relative aspect-square rounded-lg overflow-hidden border border-slate-700/30 hover:border-cyan-500/50 transition group"
              >
                <img
                  src={img.imagen_base64 || img}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition">
                    Usar
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
