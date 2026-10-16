// Selector rápido de modelo
// Permite cambiar el modelo activo directamente desde el chat

import { useState, useEffect, useRef } from 'react';
import { Cpu, Image, Eye, Video, ChevronDown, Check, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function ModelSelector({ config, onUpdate, servicios }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('texto'); // texto, vision, imagen, video
  const [modelosOllama, setModelosOllama] = useState([]);
  const [modelosA1111, setModelosA1111] = useState([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar modelos disponibles
  useEffect(() => {
    if (open) {
      cargarModelos();
    }
  }, [open]);

  const cargarModelos = async () => {
    setCargandoModelos(true);
    try {
      // Cargar modelos de Ollama
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags');
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        setModelosOllama(data.models || []);
      }
    } catch {}
    
    try {
      // Cargar modelos de A1111
      const a1111Res = await fetch('http://127.0.0.1:7860/sdapi/v1/sd-models');
      if (a1111Res.ok) {
        const data = await a1111Res.json();
        setModelosA1111(data || []);
      }
    } catch {}
    
    setCargandoModelos(false);
  };

  // Obtener el modelo actual según la pestaña
  const getModeloActual = () => {
    switch (tab) {
      case 'texto': return config.modeloTexto || 'llama3.1:8b';
      case 'vision': return config.modeloVision || 'llava:13b';
      case 'imagen': return config.parametrosImagen?.sampler || 'DPM++ 2M Karras';
      case 'video': return 'SVD (Stable Video Diffusion)';
      default: return '';
    }
  };

  const getModeloCorto = () => {
    const actual = getModeloActual();
    if (actual.length > 20) return actual.substring(0, 18) + '...';
    return actual;
  };

  const getIconoTab = () => {
    switch (tab) {
      case 'texto': return <Cpu className="w-3.5 h-3.5" />;
      case 'vision': return <Eye className="w-3.5 h-3.5" />;
      case 'imagen': return <Image className="w-3.5 h-3.5" />;
      case 'video': return <Video className="w-3.5 h-3.5" />;
      default: return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  const seleccionarModelo = (modelo) => {
    const newConfig = { ...config };
    switch (tab) {
      case 'texto':
        newConfig.modeloTexto = modelo;
        break;
      case 'vision':
        newConfig.modeloVision = modelo;
        break;
      case 'imagen':
        newConfig.parametrosImagen = { ...newConfig.parametrosImagen, sampler: modelo };
        break;
    }
    onUpdate(newConfig);
  };

  // Modelos predefinidos de texto
  const modelosTextoPredefinidos = [
    { id: 'llama3.1:8b', nombre: 'Llama 3.1 8B', descripcion: 'Rápido y eficiente' },
    { id: 'llama3.1:70b', nombre: 'Llama 3.1 70B', descripcion: 'Máxima calidad' },
    { id: 'llama3.2:3b', nombre: 'Llama 3.2 3B', descripcion: 'Ultra rápido' },
    { id: 'mistral:7b', nombre: 'Mistral 7B', descripcion: 'Equilibrado' },
    { id: 'mixtral:8x7b', nombre: 'Mixtral 8x7B', descripcion: 'Alta capacidad' },
    { id: 'gemma2:9b', nombre: 'Gemma 2 9B', descripcion: 'Google AI' },
    { id: 'qwen2.5:7b', nombre: 'Qwen 2.5 7B', descripcion: 'Multilingüe' },
    { id: 'phi3:mini', nombre: 'Phi-3 Mini', descripcion: 'Compacto Microsoft' },
    { id: 'codellama:13b', nombre: 'CodeLlama 13B', descripcion: 'Especializado código' },
    { id: 'deepseek-r1:7b', nombre: 'DeepSeek R1 7B', descripcion: 'Razonamiento' },
  ];

  // Modelos predefinidos de visión
  const modelosVisionPredefinidos = [
    { id: 'llava:13b', nombre: 'LLaVA 13B', descripcion: 'Alta precisión' },
    { id: 'llava:7b', nombre: 'LLaVA 7B', descripcion: 'Equilibrado' },
    { id: 'llava-phi3:mini', nombre: 'LLaVA Phi-3', descripcion: 'Rápido' },
    { id: 'qwen2vl:7b', nombre: 'Qwen2-VL 7B', descripcion: 'Versátil' },
    { id: 'bakllava:7b', nombre: 'BakLLaVA 7B', descripcion: 'Mistral + LLaVA' },
    { id: 'moondream:1.8b', nombre: 'Moondream 1.8B', descripcion: 'Ultra ligero' },
    { id: 'minicpm-v:8b', nombre: 'MiniCPM-V 8B', descripcion: 'Alta resolución' },
  ];

  // Samplers para imagen
  const samplersImagen = [
    'DPM++ 2M Karras',
    'DPM++ SDE Karras',
    'DPM++ 2M SDE Karras',
    'Euler a',
    'Euler',
    'DDIM',
    'UniPC',
    'LMS',
  ];

  // Filtrar modelos de Ollama que coincidan con la pestaña actual
  const getModelosDetectados = () => {
    if (modelosOllama.length === 0) return [];
    
    if (tab === 'texto') {
      return modelosOllama
        .filter(m => !m.name.includes('llava') && !m.name.includes('qwen-vl') && !m.name.includes('bakllava') && !m.name.includes('moondream'))
        .map(m => ({ id: m.name, nombre: m.name, descripcion: `${(m.size / 1e9).toFixed(1)} GB` }));
    }
    if (tab === 'vision') {
      return modelosOllama
        .filter(m => m.name.includes('llava') || m.name.includes('qwen-vl') || m.name.includes('bakllava') || m.name.includes('moondream') || m.name.includes('minicpm'))
        .map(m => ({ id: m.name, nombre: m.name, descripcion: `${(m.size / 1e9).toFixed(1)} GB` }));
    }
    return [];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
          open 
            ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30' 
            : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {getIconoTab()}
        <span className="max-w-[120px] truncate">{getModeloCorto()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
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
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                    tab === t.id
                      ? 'text-cyan-300 border-b-2 border-cyan-500 bg-cyan-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icono className="w-3.5 h-3.5" />
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
                    ? (servicios?.a1111 ? 'Conectado' : 'No disponible')
                    : (servicios?.ollama ? 'Conectado' : 'No disponible')
                }
              </span>
            </div>
            <button
              onClick={cargarModelos}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Refrescar modelos"
            >
              <RefreshCw className={`w-3 h-3 ${cargandoModelos ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Lista de modelos */}
          <div className="max-h-64 overflow-y-auto p-2">
            {cargandoModelos ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                <span className="text-xs text-slate-400 ml-2">Buscando modelos...</span>
              </div>
            ) : (
              <>
                {/* Modelos detectados (instalados) */}
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
                        instalado={true}
                        onSelect={() => seleccionarModelo(modelo.id)}
                      />
                    ))}
                  </>
                )}

                {/* Modelos predefinidos */}
                <div className="px-2 py-1.5 mt-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {getModelosDetectados().length > 0 ? 'Otros modelos' : 'Modelos disponibles'}
                  </span>
                </div>
                {(tab === 'texto' ? modelosTextoPredefinidos : tab === 'vision' ? modelosVisionPredefinidos : samplersImagen.map(s => ({ id: s, nombre: s, descripcion: 'Sampler' }))).map(modelo => {
                  const detectado = getModelosDetectados().find(m => m.id === modelo.id);
                  if (detectado) return null; // Ya mostrado arriba
                  return (
                    <ModeloItem
                      key={modelo.id}
                      modelo={modelo}
                      seleccionado={getModeloActual() === modelo.id}
                      instalado={!!detectado}
                      onSelect={() => seleccionarModelo(modelo.id)}
                    />
                  );
                })}

                {/* Modelos A1111 para imagen */}
                {tab === 'imagen' && modelosA1111.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 mt-1">
                      <span className="text-xs font-semibold text-purple-400/80">🎨 Checkpoints A1111</span>
                    </div>
                    {modelosA1111.map(modelo => (
                      <ModeloItem
                        key={modelo.model_name || modelo.title}
                        modelo={{ id: modelo.model_name, nombre: modelo.title || modelo.model_name, descripcion: 'Checkpoint' }}
                        seleccionado={false}
                        instalado={true}
                        onSelect={() => {}}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer con info */}
          <div className="px-3 py-2 border-t border-slate-800/30 bg-slate-950/50">
            <p className="text-xs text-slate-500">
              {tab === 'texto' && '💡 Instala más: ollama pull <modelo>'}
              {tab === 'vision' && '💡 Modelos VLM para análisis de imágenes'}
              {tab === 'imagen' && '💡 Samplers para generación con A1111'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Item individual de modelo en la lista
 */
function ModeloItem({ modelo, seleccionado, instalado, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
        seleccionado
          ? 'bg-cyan-600/15 border border-cyan-500/20'
          : 'hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        instalado ? 'bg-green-400' : 'bg-slate-600'
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${
          seleccionado ? 'text-cyan-300' : 'text-slate-200'
        }`}>
          {modelo.nombre}
        </p>
        {modelo.descripcion && (
          <p className="text-xs text-slate-500 truncate">{modelo.descripcion}</p>
        )}
      </div>
      {seleccionado && (
        <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
      )}
    </button>
  );
}
