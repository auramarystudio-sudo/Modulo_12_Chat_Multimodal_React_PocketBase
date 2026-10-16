// Selector rápido de modelo - Optimizado para móvil
// Compacto en header, con dropdown accesible

import { useState, useEffect, useRef } from 'react';
import { Cpu, Image, Eye, Video, ChevronDown, Check, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function ModelSelector({ config, onUpdate, servicios }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('texto');
  const [modelosOllama, setModelosOllama] = useState([]);
  const [modelosA1111, setModelosA1111] = useState([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) cargarModelos();
  }, [open]);

  const cargarModelos = async () => {
    setCargandoModelos(true);
    try {
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags');
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        setModelosOllama(data.models || []);
      }
    } catch {}
    try {
      const a1111Res = await fetch('http://127.0.0.1:7860/sdapi/v1/sd-models');
      if (a1111Res.ok) {
        const data = await a1111Res.json();
        setModelosA1111(data || []);
      }
    } catch {}
    setCargandoModelos(false);
  };

  const getModeloActual = () => {
    switch (tab) {
      case 'texto': return config.modeloTexto || 'llama3.1:8b';
      case 'vision': return config.modeloVision || 'llava:13b';
      case 'imagen': return config.parametrosImagen?.sampler || 'DPM++ 2M';
      default: return '';
    }
  };

  const getModeloCorto = () => {
    const actual = getModeloActual();
    if (actual.length > 14) return actual.substring(0, 12) + '...';
    return actual;
  };

  const getIconoTab = () => {
    switch (tab) {
      case 'texto': return <Cpu className="w-3.5 h-3.5" />;
      case 'vision': return <Eye className="w-3.5 h-3.5" />;
      case 'imagen': return <Image className="w-3.5 h-3.5" />;
      default: return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  const seleccionarModelo = (modelo) => {
    const newConfig = { ...config };
    switch (tab) {
      case 'texto': newConfig.modeloTexto = modelo; break;
      case 'vision': newConfig.modeloVision = modelo; break;
      case 'imagen': newConfig.parametrosImagen = { ...newConfig.parametrosImagen, sampler: modelo }; break;
    }
    onUpdate(newConfig);
  };

  const modelosTextoPredefinidos = [
    { id: 'llama3.1:8b', nombre: 'Llama 3.1 8B' },
    { id: 'llama3.1:70b', nombre: 'Llama 3.1 70B' },
    { id: 'llama3.2:3b', nombre: 'Llama 3.2 3B' },
    { id: 'mistral:7b', nombre: 'Mistral 7B' },
    { id: 'mixtral:8x7b', nombre: 'Mixtral 8x7B' },
    { id: 'gemma2:9b', nombre: 'Gemma 2 9B' },
    { id: 'qwen2.5:7b', nombre: 'Qwen 2.5 7B' },
    { id: 'phi3:mini', nombre: 'Phi-3 Mini' },
    { id: 'deepseek-r1:7b', nombre: 'DeepSeek R1' },
  ];

  const modelosVisionPredefinidos = [
    { id: 'llava:13b', nombre: 'LLaVA 13B' },
    { id: 'llava:7b', nombre: 'LLaVA 7B' },
    { id: 'qwen2vl:7b', nombre: 'Qwen2-VL 7B' },
    { id: 'bakllava:7b', nombre: 'BakLLaVA 7B' },
    { id: 'moondream:1.8b', nombre: 'Moondream' },
    { id: 'minicpm-v:8b', nombre: 'MiniCPM-V 8B' },
  ];

  const samplersImagen = [
    'DPM++ 2M Karras', 'DPM++ SDE Karras', 'Euler a', 'Euler', 'DDIM', 'UniPC'
  ];

  const getModelosDetectados = () => {
    if (modelosOllama.length === 0) return [];
    if (tab === 'texto') {
      return modelosOllama
        .filter(m => !m.name.includes('llava') && !m.name.includes('qwen-vl') && !m.name.includes('bakllava') && !m.name.includes('moondream') && !m.name.includes('minicpm'))
        .map(m => ({ id: m.name, nombre: m.name }));
    }
    if (tab === 'vision') {
      return modelosOllama
        .filter(m => m.name.includes('llava') || m.name.includes('qwen-vl') || m.name.includes('bakllava') || m.name.includes('moondream') || m.name.includes('minicpm'))
        .map(m => ({ id: m.name, nombre: m.name }));
    }
    return [];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón trigger - Compacto para header */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition border active:scale-95 ${
          open 
            ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30' 
            : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-800'
        }`}
      >
        {getIconoTab()}
        <span className="max-w-[80px] sm:max-w-[120px] truncate text-xs">{getModeloCorto()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm bg-slate-900/98 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800/50">
            {[
              { id: 'texto', icono: Cpu, label: 'Texto' },
              { id: 'vision', icono: Eye, label: 'Visión' },
              { id: 'imagen', icono: Image, label: 'Imagen' },
            ].map(t => {
              const Icono = t.icono;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition active:scale-95 ${
                    tab === t.id
                      ? 'text-cyan-300 border-b-2 border-cyan-500 bg-cyan-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Estado de servicio */}
          <div className="px-3 py-2 border-b border-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {servicios?.ollama ? (
                <Wifi className="w-3 h-3 text-green-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-slate-500" />
              )}
              <span className="text-xs text-slate-400">
                {tab === 'imagen' ? 'A1111' : 'Ollama'}: {
                  tab === 'imagen' 
                    ? (servicios?.a1111 ? 'Online' : 'Offline')
                    : (servicios?.ollama ? 'Online' : 'Offline')
                }
              </span>
            </div>
            <button
              onClick={cargarModelos}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-90"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargandoModelos ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Lista de modelos */}
          <div className="max-h-72 overflow-y-auto p-2">
            {cargandoModelos ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                <span className="text-xs text-slate-400 ml-2">Buscando...</span>
              </div>
            ) : (
              <>
                {/* Modelos detectados */}
                {getModelosDetectados().length > 0 && (
                  <>
                    <div className="px-2 py-1.5">
                      <span className="text-xs font-semibold text-green-400/80">✓ Instalados</span>
                    </div>
                    {getModelosDetectados().map(modelo => (
                      <ModeloItem
                        key={modelo.id}
                        modelo={modelo}
                        seleccionado={getModeloActual() === modelo.id}
                        onSelect={() => seleccionarModelo(modelo.id)}
                      />
                    ))}
                  </>
                )}

                {/* Modelos predefinidos */}
                <div className="px-2 py-1.5 mt-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {getModelosDetectados().length > 0 ? 'Otros' : 'Disponibles'}
                  </span>
                </div>
                {(tab === 'texto' ? modelosTextoPredefinidos : tab === 'vision' ? modelosVisionPredefinidos : samplersImagen.map(s => ({ id: s, nombre: s }))).map(modelo => {
                  const detectado = getModelosDetectados().find(m => m.id === modelo.id);
                  if (detectado) return null;
                  return (
                    <ModeloItem
                      key={modelo.id}
                      modelo={modelo}
                      seleccionado={getModeloActual() === modelo.id}
                      onSelect={() => seleccionarModelo(modelo.id)}
                    />
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2.5 border-t border-slate-800/30 bg-slate-950/50">
            <p className="text-xs text-slate-500 text-center">
              {tab === 'texto' && '💡 ollama pull <modelo>'}
              {tab === 'vision' && '💡 Modelos VLM para análisis'}
              {tab === 'imagen' && '💡 Samplers para A1111'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ModeloItem({ modelo, seleccionado, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition active:scale-98 ${
        seleccionado
          ? 'bg-cyan-600/15 border border-cyan-500/20'
          : 'hover:bg-slate-800/50 active:bg-slate-800 border border-transparent'
      }`}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        seleccionado ? 'bg-cyan-400' : 'bg-slate-600'
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          seleccionado ? 'text-cyan-300' : 'text-slate-200'
        }`}>
          {modelo.nombre}
        </p>
      </div>
      {seleccionado && (
        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
      )}
    </button>
  );
}
