// Componente de subida de archivos
// Drag & drop + botón para subir imágenes

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function FileUpload({ onFileSelect, accept = 'image/*', multiple = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      procesarArchivo(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      procesarArchivo(files[0]);
    }
  };

  const procesarArchivo = (file) => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede superar 10MB');
      return;
    }

    setArchivo(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    
    onFileSelect?.(file);
  };

  const removeFile = () => {
    setArchivo(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Zona de drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
          ${dragActive 
            ? 'border-cyan-500/50 bg-cyan-600/10' 
            : 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/20'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-cyan-400' : 'text-slate-500'}`} />
        <p className="text-sm text-slate-400">
          Arrastra una imagen aquí o <span className="text-cyan-400">haz clic</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PNG, JPG, WEBP (máx. 10MB)
        </p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg animate-fade-in">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700/50 flex-shrink-0">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{archivo?.name}</p>
            <p className="text-xs text-slate-500">
              {(archivo?.size / 1024).toFixed(1)} KB • {archivo?.type}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
