// Input de mensaje del chat
// Incluye campo de texto, botón de enviar, y botón de adjuntar archivo

import { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';

export default function ChatInput({ onSend, cargando, modoActual }) {
  const [mensaje, setMensaje] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!mensaje.trim() && !archivo) || cargando) return;
    
    onSend(mensaje.trim(), archivo);
    setMensaje('');
    setArchivo(null);
    setPreviewUrl(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes por ahora');
      return;
    }
    
    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede superar 10MB');
      return;
    }
    
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setArchivo(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextareaChange = (e) => {
    setMensaje(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const getPlaceholder = () => {
    switch (modoActual) {
      case 'imagen': return 'Describe la imagen que quieres generar...';
      case 'video': return 'Describe el video o anima una imagen...';
      case 'analisis': return 'Sube una imagen y pregunta sobre ella...';
      default: return 'Escribe tu mensaje...';
    }
  };

  return (
    <div className="border-t border-slate-800/50 bg-slate-900/90 backdrop-blur-xl p-3">
      {/* Preview de archivo adjunto */}
      {previewUrl && (
        <div className="mb-2 flex items-center gap-2 animate-fade-in">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700/50">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate">{archivo?.name}</p>
            <p className="text-xs text-slate-500">
              {(archivo?.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeFile}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulario de input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Botón adjuntar */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0"
          title="Adjuntar imagen"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Campo de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={mensaje}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-none text-sm"
            disabled={cargando}
          />
        </div>

        {/* Botón enviar */}
        <button
          type="submit"
          disabled={(!mensaje.trim() && !archivo) || cargando}
          className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg flex-shrink-0 disabled:opacity-30 disabled:hover:bg-cyan-600"
        >
          {cargando ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Indicador de modo actual */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-slate-500">
          {modoActual === 'auto' ? '✨ Detección automática' : 
           modoActual === 'texto' ? '💬 Modo texto' :
           modoActual === 'imagen' ? '🎨 Modo imagen' :
           modoActual === 'video' ? '🎬 Modo video' :
           '🖼️ Modo análisis'}
        </span>
        <span className="text-xs text-slate-600">
          Enter para enviar
        </span>
      </div>
    </div>
  );
}
