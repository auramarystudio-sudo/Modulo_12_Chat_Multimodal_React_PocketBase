// Configuración del chat
// Permite ajustar modelos y parámetros con detección automática

import { useState, useEffect } from 'react';
import { Settings, X, Cpu, Image, Video, Eye, RefreshCw, Wifi, WifiOff, Download } from 'lucide-react';

export default function ChatSettings({ config, onUpdate, visible, onClose }) {
  const [localConfig, setLocalConfig] = useState(config || {});
  const [modelosOllama, setModelosOllama] = useState([]);
  const [modelosA1111, setModelosA1111] = useState([]);
  const [servicios, setServicios] = useState({ ollama: false, a1111: false });
  const [cargando, setCargando] = useState(false);

  // Sincronizar config local con prop
  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  // Cargar modelos al abrir
  useEffect(() => {
    if (visible) {
      cargarModelos();
    }
  }, [visible]);

  const cargarModelos = async () => {
    setCargando(true);
    const results = { ollama: false, a1111: false };

    try {
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags');
      if (ollamaRes.ok) {
        results.ollama = true;
        const data = await ollamaRes.json();
        setModelosOllama(data.models || []);
      }
    } catch {}

    try {
      const a1111Res = await fetch('http://127.0.0.1:7860/sdapi/v1/sd-models');
      if (a1111Res.ok) {
        results.a1111 = true;
        const data = await a1111Res.json();
        setModelosA1111(data || []);
      }
    } catch {}

    setServicios(results);
    setCargando(false);
  };

  if (!visible) return null;

  const handleSave = () => {
    onUpdate(localConfig);
    onClose();
  };

  const updateField = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  // Separar modelos de texto y visión
  const modelosTexto = modelosOllama.filter(m => 
    !m.name.includes('llava') && !m.name.includes('qwen-vl') && 
    !m.name.includes('bakllava') && !m.name.includes('moondream') &&
    !m.name.includes('minicpm')
  );
  const modelosVision = modelosOllama.filter(m => 
    m.name.includes('llava') || m.name.includes('qwen-vl') || 
    m.name.includes('bakllava') || m.name.includes('moondream') ||
    m.name.includes('minicpm') || m.name.includes('vision')
  );

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Panel - Bottom sheet en móvil, Drawer en desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:inset-x-auto md:left-auto md:right-0 md:w-80 bg-slate-900/98 backdrop-blur-xl md:border-l border-t md:border-t-0 border-slate-800/50 z-50 flex flex-col shadow-2xl rounded-t-3xl md:rounded-t-none max-h-[85vh] md:max-h-full animate-slide-up">
        {/* Handle para arrastrar (solo móvil) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-4 pt-2 pb-3 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Configuración
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={cargarModelos}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-90"
              title="Refrescar modelos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Estado de servicios */}
          <section className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Servicios</h3>
            <div className="space-y-1.5">
              <ServiceStatus 
                nombre="Ollama" 
                conectado={servicios.ollama} 
                modelos={modelosTexto.length + modelosVision.length}
              />
              <ServiceStatus 
                nombre="A1111" 
                conectado={servicios.a1111}
                modelos={modelosA1111.length}
              />
            </div>
          </section>

          {/* Modelo de texto */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Modelo de Texto</h3>
            </div>
            
            {/* Modelos detectados */}
            {modelosTexto.length > 0 && (
              <div className="mb-2">
                <label className="text-xs text-green-400/80 mb-1 block">✓ Detectados en Ollama</label>
                <select
                  value={localConfig.modeloTexto || ''}
                  onChange={(e) => updateField('modeloTexto', e.target.value)}
                  className="w-full bg-slate-800/50 border border-green-700/30 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                >
                  {modelosTexto.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({(m.size / 1e9).toFixed(1)} GB)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Modelos predefinidos */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {modelosTexto.length > 0 ? 'O selecciona manualmente' : 'Selecciona un modelo'}
              </label>
              <select
                value={localConfig.modeloTexto || 'llama3.1:8b'}
                onChange={(e) => updateField('modeloTexto', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              >
                <optgroup label="Populares">
                  <option value="llama3.1:8b">Llama 3.1 8B</option>
                  <option value="llama3.1:70b">Llama 3.1 70B</option>
                  <option value="llama3.2:3b">Llama 3.2 3B</option>
                  <option value="mistral:7b">Mistral 7B</option>
                  <option value="mixtral:8x7b">Mixtral 8x7B</option>
                </optgroup>
                <optgroup label="Otros">
                  <option value="gemma2:9b">Gemma 2 9B</option>
                  <option value="qwen2.5:7b">Qwen 2.5 7B</option>
                  <option value="phi3:mini">Phi-3 Mini</option>
                  <option value="codellama:13b">CodeLlama 13B</option>
                  <option value="deepseek-r1:7b">DeepSeek R1 7B</option>
                </optgroup>
              </select>
            </div>
            
            {!servicios.ollama && (
              <div className="mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-800/30">
                <p className="text-xs text-amber-300">
                  ⚠️ Ollama no detectado. Ejecuta: <code className="bg-slate-900/50 px-1 rounded">ollama serve</code>
                </p>
              </div>
            )}
          </section>

          {/* Modelo de visión */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-slate-200">Modelo de Visión</h3>
            </div>
            
            {/* Modelos detectados */}
            {modelosVision.length > 0 && (
              <div className="mb-2">
                <label className="text-xs text-green-400/80 mb-1 block">✓ Detectados en Ollama</label>
                <select
                  value={localConfig.modeloVision || ''}
                  onChange={(e) => updateField('modeloVision', e.target.value)}
                  className="w-full bg-slate-800/50 border border-green-700/30 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                >
                  {modelosVision.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({(m.size / 1e9).toFixed(1)} GB)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Modelos predefinidos */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {modelosVision.length > 0 ? 'O selecciona manualmente' : 'Selecciona un modelo VLM'}
              </label>
              <select
                value={localConfig.modeloVision || 'llava:13b'}
                onChange={(e) => updateField('modeloVision', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              >
                <option value="llava:13b">LLaVA 13B</option>
                <option value="llava:7b">LLaVA 7B</option>
                <option value="llava-phi3:mini">LLaVA Phi-3 Mini</option>
                <option value="qwen2vl:7b">Qwen2-VL 7B</option>
                <option value="bakllava:7b">BakLLaVA 7B</option>
                <option value="moondream:1.8b">Moondream 1.8B</option>
                <option value="minicpm-v:8b">MiniCPM-V 8B</option>
              </select>
            </div>
          </section>

          {/* Parámetros de imagen */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-slate-200">Parámetros de Imagen</h3>
            </div>

            {/* Checkpoint A1111 */}
            {modelosA1111.length > 0 && (
              <div className="mb-3">
                <label className="text-xs text-green-400/80 mb-1 block">✓ Checkpoint A1111</label>
                <select
                  value={localConfig.parametrosImagen?.checkpoint || ''}
                  onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, checkpoint: e.target.value })}
                  className="w-full bg-slate-800/50 border border-green-700/30 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                >
                  {modelosA1111.map(m => (
                    <option key={m.model_name} value={m.model_name}>
                      {m.title || m.model_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sampler</label>
                <select
                  value={localConfig.parametrosImagen?.sampler || 'DPM++ 2M Karras'}
                  onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, sampler: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                >
                  <option value="DPM++ 2M Karras">DPM++ 2M Karras</option>
                  <option value="DPM++ SDE Karras">DPM++ SDE Karras</option>
                  <option value="DPM++ 2M SDE Karras">DPM++ 2M SDE Karras</option>
                  <option value="Euler a">Euler a</option>
                  <option value="Euler">Euler</option>
                  <option value="DDIM">DDIM</option>
                  <option value="UniPC">UniPC</option>
                  <option value="LMS">LMS</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Steps</label>
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.steps || 20}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, steps: parseInt(e.target.value) || 20 })}
                    min={1}
                    max={100}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CFG Scale</label>
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.cfg_scale || 7}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, cfg_scale: parseFloat(e.target.value) || 7 })}
                    min={1}
                    max={30}
                    step={0.5}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tamaño</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.width || 512}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, width: parseInt(e.target.value) || 512 })}
                    placeholder="Ancho"
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 transition text-sm"
                  />
                  <input
                    type="number"
                    value={localConfig.parametrosImagen?.height || 512}
                    onChange={(e) => updateField('parametrosImagen', { ...localConfig.parametrosImagen, height: parseInt(e.target.value) || 512 })}
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
                  onChange={(e) => updateField('parametrosVideo', { ...localConfig.parametrosVideo, frames: parseInt(e.target.value) || 14 })}
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
                  onChange={(e) => updateField('parametrosVideo', { ...localConfig.parametrosVideo, fps: parseInt(e.target.value) || 8 })}
                  min={1}
                  max={30}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                />
              </div>
            </div>
          </section>

          {/* Comandos útiles */}
          <section className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Comandos útiles</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Download className="w-3 h-3" />
                <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-cyan-300">ollama pull llama3.1:8b</code>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Download className="w-3 h-3" />
                <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-cyan-300">ollama pull llava:13b</code>
              </div>
            </div>
          </section>
        </div>

        {/* Footer con botón guardar */}
        <div className="p-4 border-t border-slate-800/50 pb-safe">
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition shadow-lg active:scale-95"
          >
            <Settings className="w-4 h-4" />
            Guardar configuración
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Estado de servicio individual
 */
function ServiceStatus({ nombre, conectado, modelos = 0 }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {conectado ? (
          <Wifi className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className="text-sm text-slate-200">{nombre}</span>
      </div>
      <div className="flex items-center gap-2">
        {modelos > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400">
            {modelos} modelos
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          conectado 
            ? 'bg-green-950/50 text-green-400' 
            : 'bg-slate-800/50 text-slate-500'
        }`}>
          {conectado ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
