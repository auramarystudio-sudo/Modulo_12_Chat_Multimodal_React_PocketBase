// Configuración del chat
// Permite ajustar modelos y parámetros

import { useState } from 'react';
import { Settings, X, Cpu, Image, Video, Eye } from 'lucide-react';

export default function ChatSettings({ config, onUpdate, visible, onClose }) {
  const [localConfig, setLocalConfig] = useState(config || {});

  if (!visible) return null;

  const handleSave = () => {
    onUpdate(localConfig);
    onClose();
  };

  const updateField = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/50 z-50 flex flex-col shadow-xl animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Modelo de texto */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Modelo de Texto</h3>
            </div>
            <select
              value={localConfig.modeloTexto || 'llama3.1:8b'}
              onChange={(e) => updateField('modeloTexto', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
            >
              <option value="llama3.1:8b">Llama 3.1 8B</option>
              <option value="llama3.1:70b">Llama 3.1 70B</option>
              <option value="mistral:7b">Mistral 7B</option>
              <option value="mixtral:8x7b">Mixtral 8x7B</option>
              <option value="codellama:13b">CodeLlama 13B</option>
              <option value="gemma:7b">Gemma 7B</option>
              <option value="phi3:mini">Phi-3 Mini</option>
            </select>
          </section>

          {/* Modelo de visión */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-slate-200">Modelo de Visión</h3>
            </div>
            <select
              value={localConfig.modeloVision || 'llava:13b'}
              onChange={(e) => updateField('modeloVision', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
            >
              <option value="llava:13b">LLaVA 13B</option>
              <option value="llava:7b">LLaVA 7B</option>
              <option value="qwen-vl:7b">Qwen-VL 7B</option>
              <option value="bakllava:7b">BakLLaVA 7B</option>
              <option value="moondream:1.8b">Moondream 1.8B</option>
            </select>
          </section>

          {/* Parámetros de imagen */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-slate-200">Parámetros de Imagen</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Steps</label>
                <input
                  type="number"
                  value={localConfig.parametrosImagen?.steps || 20}
                  onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, steps: parseInt(e.target.value) })}
                  min={1}
                  max={100}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">CFG Scale</label>
                <input
                  type="number"
                  value={localConfig.parametrosImagen?.cfg_scale || 7}
                  onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, cfg_scale: parseFloat(e.target.value) })}
                  min={1}
                  max={30}
                  step={0.5}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tamaño</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.width || 512}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, width: parseInt(e.target.value) })}
                    placeholder="Ancho"
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                  />
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.height || 512}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, height: parseInt(e.target.value) })}
                    placeholder="Alto"
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Negative Prompt</label>
                <textarea
                  value={localConfig.parametrosImagen?.negative_prompt || ''}
                  onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, negative_prompt: e.target.value })}
                  placeholder="low quality, blurry, deformed..."
                  rows={2}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Parámetros de video */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-200">Parámetros de Video</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Frames</label>
                <input
                  type="number"
                  value={localConfig.parametrosVideo?.frames || 14}
                  onChange={(e) => updateField('parametrosVideo', { ...localConfig.parametrosVideo, frames: parseInt(e.target.value) })}
                  min={2}
                  max={50}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">FPS</label>
                <input
                  type="number"
                  value={localConfig.parametrosVideo?.fps || 8}
                  onChange={(e) => updateField('parametrosVideo', { ...localConfig.parametrosVideo, fps: parseInt(e.target.value) })}
                  min={1}
                  max={30}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer con botón guardar */}
        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-lg"
          >
            <Settings className="w-4 h-4" />
            Guardar configuración
          </button>
        </div>
      </div>
    </>
  );
}
