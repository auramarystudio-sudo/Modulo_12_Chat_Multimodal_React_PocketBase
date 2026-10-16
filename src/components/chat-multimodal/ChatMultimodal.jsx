// Componente principal del Chat Multimodal
// Integra todos los subcomponentes y gestiona el estado de la conversación

import { useState, useRef, useEffect } from 'react';
import { 
  Menu, Settings, Key, Image, Sparkles, 
  LogOut, Wifi, WifiOff 
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import ChatSettings from './ChatSettings';
import ModeSelector from './ModeSelector';
import ProgressIndicator from './ProgressIndicator';
import QuickGallery from './QuickGallery';
import TokenManager from './TokenManager';
import ModelSelector from './ModelSelector';
import { procesarMensaje, crearContextoChat } from '../../utils/chat-engine';

export default function ChatMultimodal({ authData, onLogout }) {
  // Estado de sesiones
  const [sesiones, setSesiones] = useState([]);
  const [sesionActual, setSesionActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  
  // Estado de UI
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [tokenManagerVisible, setTokenManagerVisible] = useState(false);
  
  // Estado de chat
  const [modoActual, setModoActual] = useState('auto');
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [config, setConfig] = useState({
    modeloTexto: 'llama3.1:8b',
    modeloVision: 'llava:13b',
    parametrosImagen: { steps: 20, cfg_scale: 7, width: 512, height: 512, negative_prompt: '' },
    parametrosVideo: { frames: 14, fps: 8 }
  });
  
  // Estado de servicios
  const [servicios, setServicios] = useState({ ollama: false, a1111: false, comfyui: false });
  
  // Estado de tokens
  const [tokens, setTokens] = useState([]);
  
  // Galería de imágenes generadas
  const [galeriaImagenes, setGaleriaImagenes] = useState([]);
  
  // Refs
  const mensajesEndRef = useRef(null);
  const archivoAdjuntoRef = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Verificar servicios al montar y crear sesión inicial
  useEffect(() => {
    verificarServicios();
    // Crear sesión inicial si no hay
    if (sesiones.length === 0 && !sesionActual) {
      const nuevaSesion = {
        id: `session_${Date.now()}`,
        titulo: 'Nueva conversación',
        modo_predeterminado: 'auto',
        mensajes: [],
        total_mensajes: 0,
        ultima_actividad: new Date().toISOString(),
        creado_en: new Date().toISOString()
      };
      setSesiones([nuevaSesion]);
      setSesionActual(nuevaSesion);
    }
  }, []);

  const verificarServicios = async () => {
    const results = { ollama: false, a1111: false, comfyui: false };
    
    try {
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags');
      results.ollama = ollamaRes.ok;
    } catch {}
    
    try {
      const a1111Res = await fetch('http://127.0.0.1:7860/sdapi/v1/options');
      results.a1111 = a1111Res.ok;
    } catch {}
    
    try {
      const comfyRes = await fetch('http://127.0.0.1:8188/system_stats');
      results.comfyui = comfyRes.ok;
    } catch {}
    
    setServicios(results);
  };

  // Crear nueva sesión
  const crearNuevaSesion = () => {
    const nuevaSesion = {
      id: `session_${Date.now()}`,
      titulo: 'Nueva conversación',
      modo_predeterminado: 'auto',
      mensajes: [],
      total_mensajes: 0,
      ultima_actividad: new Date().toISOString(),
      creado_en: new Date().toISOString()
    };
    
    setSesiones(prev => [nuevaSesion, ...prev]);
    setSesionActual(nuevaSesion);
    setMensajes([]);
    setSidebarVisible(false);
  };

  // Seleccionar sesión
  const seleccionarSesion = (sesion) => {
    setSesionActual(sesion);
    setMensajes(sesion.mensajes || []);
    setSidebarVisible(false);
  };

  // Eliminar sesión
  const eliminarSesion = (id) => {
    setSesiones(prev => prev.filter(s => s.id !== id));
    if (sesionActual?.id === id) {
      const remaining = sesiones.filter(s => s.id !== id);
      if (remaining.length > 0) {
        seleccionarSesion(remaining[0]);
      } else {
        crearNuevaSesion();
      }
    }
  };

  // Convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Enviar mensaje
  const enviarMensaje = async (texto, archivo = null) => {
    if (!texto && !archivo) return;
    
    // Mensaje del usuario
    let imagenAdjunta = null;
    if (archivo) {
      imagenAdjunta = await fileToBase64(archivo);
    }
    
    const mensajeUsuario = {
      id: `msg_${Date.now()}`,
      tipo: 'texto_usuario',
      rol: 'usuario',
      contenido: texto || '(imagen adjunta)',
      imagen_adjunta: imagenAdjunta,
      timestamp: new Date().toISOString()
    };

    // Guardar archivo adjunto para el motor
    archivoAdjuntoRef.current = archivo;

    // Actualizar mensajes
    const nuevosMensajes = [...mensajes, mensajeUsuario];
    setMensajes(nuevosMensajes);
    setCargando(true);

    // Determinar mensaje de progreso
    const tipoProgreso = modoActual === 'auto' ? 'texto' : modoActual;
    setProgreso({
      activo: true,
      tipo: tipoProgreso,
      mensaje: getProgresoMensaje(tipoProgreso)
    });

    try {
      // Crear contexto para el motor
      const contexto = crearContextoChat({
        modoForzado: modoActual,
        historial: mensajes.slice(-10),
        modeloTexto: config.modeloTexto,
        modeloVision: config.modeloVision,
        parametrosImagen: config.parametrosImagen,
        parametrosVideo: config.parametrosVideo,
        sessionId: sesionActual?.id
      });

      // Procesar mensaje
      const resultado = await procesarMensaje(texto, contexto, archivo);
      
      // Mensaje de respuesta
      const mensajeIA = {
        id: `msg_${Date.now()}_ia`,
        ...resultado,
        rol: 'ia',
        timestamp: new Date().toISOString()
      };

      // Actualizar mensajes con respuesta
      const mensajesActualizados = [...nuevosMensajes, mensajeIA];
      setMensajes(mensajesActualizados);

      // Si es imagen, agregar a galería
      if (resultado.tipo === 'imagen_generada' && resultado.imagen_base64) {
        setGaleriaImagenes(prev => [resultado, ...prev].slice(0, 20));
      }

      // Actualizar sesión
      actualizarSesion(mensajesActualizados);
      
    } catch (error) {
      const mensajeError = {
        id: `msg_${Date.now()}_error`,
        tipo: 'error',
        contenido: `Error: ${error.message}`,
        rol: 'sistema',
        timestamp: new Date().toISOString()
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setCargando(false);
      setProgreso(null);
      archivoAdjuntoRef.current = null;
    }
  };

  // Actualizar sesión con nuevos mensajes
  const actualizarSesion = (nuevosMensajes) => {
    if (!sesionActual) return;
    
    const titulo = nuevosMensajes.length > 0 && nuevosMensajes[0].tipo === 'texto_usuario'
      ? nuevosMensajes[0].contenido.substring(0, 40) + (nuevosMensajes[0].contenido.length > 40 ? '...' : '')
      : sesionActual.titulo;

    const sesionActualizada = {
      ...sesionActual,
      titulo,
      mensajes: nuevosMensajes,
      total_mensajes: nuevosMensajes.length,
      ultima_actividad: new Date().toISOString()
    };

    setSesionActual(sesionActualizada);
    setSesiones(prev => prev.map(s => s.id === sesionActualizada.id ? sesionActualizada : s));
  };

  // Acciones en mensajes
  const handleMensajeAction = (accion, mensaje) => {
    switch (accion) {
      case 'regenerar':
        // Encontrar el mensaje de usuario anterior y regenerar
        const idx = mensajes.findIndex(m => m.id === mensaje.id);
        if (idx > 0) {
          const mensajeUsuarioAnterior = mensajes[idx - 1];
          if (mensajeUsuarioAnterior.rol === 'usuario') {
            // Eliminar la respuesta actual y regenerar
            const mensajesSinRespuesta = mensajes.slice(0, idx);
            setMensajes(mensajesSinRespuesta);
            enviarMensaje(mensajeUsuarioAnterior.contenido);
          }
        }
        break;
      case 'favorito':
        // Toggle favorito
        setMensajes(prev => prev.map(m => 
          m.id === mensaje.id ? { ...m, favorito: !m.favorito } : m
        ));
        break;
      case 'reintentar':
        // Reintentar último mensaje
        const ultimoUsuario = [...mensajes].reverse().find(m => m.rol === 'usuario');
        if (ultimoUsuario) {
          enviarMensaje(ultimoUsuario.contenido);
        }
        break;
    }
  };

  // Mensaje de progreso según el modo
  const getProgresoMensaje = (modo) => {
    switch (modo) {
      case 'imagen': return 'Generando imagen...';
      case 'video': return 'Generando video...';
      case 'analisis': return 'Analizando imagen...';
      case 'texto': return 'Pensando...';
      default: return 'Procesando...';
    }
  };

  // Modos permitidos según token
  const modosPermitidos = authData?.data?.modos_permitidos || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* Header flotante */}
      <header className="border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarVisible(true)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                Chat IA Multimodal
              </h1>
            </div>
          </div>

          {/* Center - Model Selector */}
          <div className="flex items-center gap-2">
            <ModelSelector 
              config={config} 
              onUpdate={setConfig} 
              servicios={servicios} 
            />
            <div className="hidden lg:flex items-center gap-1">
              <StatusBadge activo={servicios.ollama} label="Ollama" />
              <StatusBadge activo={servicios.a1111} label="A1111" />
              <StatusBadge activo={servicios.comfyui} label="ComfyUI" />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGalleryVisible(true)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Galería"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTokenManagerVisible(true)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Tokens"
            >
              <Key className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSettingsVisible(true)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Configuración"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Mensaje de bienvenida si está vacío */}
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-slate-700/30 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                ¡Hola! Soy tu asistente IA
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Puedo conversar contigo, generar imágenes, crear videos y analizar fotos. ¿Qué te gustaría hacer?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
                <SugerenciaButton
                  texto="💬 Cuéntame sobre Stable Diffusion"
                  onClick={() => enviarMensaje('Cuéntame sobre Stable Diffusion')}
                />
                <SugerenciaButton
                  texto="🎨 Genera un paisaje cyberpunk"
                  onClick={() => enviarMensaje('Genera una imagen de un paisaje cyberpunk con neón')}
                />
                <SugerenciaButton
                  texto="🖼️ Analiza una imagen"
                  onClick={() => enviarMensaje('Quiero analizar una imagen, ¿cómo lo hago?')}
                />
                <SugerenciaButton
                  texto="✨ ¿Qué puedes hacer?"
                  onClick={() => enviarMensaje('¿Qué puedes hacer?')}
                />
              </div>
            </div>
          )}

          {/* Lista de mensajes */}
          {mensajes.map((msg) => (
            <ChatMessage
              key={msg.id}
              mensaje={msg}
              onAction={handleMensajeAction}
            />
          ))}

          {/* Indicador de progreso */}
          <ProgressIndicator
            activo={cargando}
            tipo={progreso?.tipo}
            mensaje={progreso?.mensaje}
          />

          <div ref={mensajesEndRef} />
        </div>

        {/* Selector de modo */}
        <div className="px-4 pt-2">
          <ModeSelector
            modoActual={modoActual}
            onModoChange={setModoActual}
            modosPermitidos={modosPermitidos}
          />
        </div>

        {/* Input */}
        <ChatInput
          onSend={enviarMensaje}
          cargando={cargando}
          modoActual={modoActual}
        />
      </div>

      {/* Paneles laterales */}
      <ChatSidebar
        sesiones={sesiones}
        sesionActual={sesionActual}
        onSelectSesion={seleccionarSesion}
        onNuevaSesion={crearNuevaSesion}
        onEliminarSesion={eliminarSesion}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <ChatSettings
        config={config}
        onUpdate={setConfig}
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      <QuickGallery
        imagenes={galeriaImagenes}
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        onSelect={(img) => {
          // Usar imagen para img2img o análisis
          enviarMensaje('Usa esta imagen como referencia');
        }}
      />

      <TokenManager
        tokens={tokens}
        onCrearToken={(token) => setTokens(prev => [...prev, token])}
        onEliminarToken={(tokenId) => setTokens(prev => prev.filter(t => t.token !== tokenId))}
        visible={tokenManagerVisible}
        onClose={() => setTokenManagerVisible(false)}
      />

      {/* Info demo */}
      {authData?.demo && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/30 text-xs text-amber-300 z-10">
          ⚠️ Modo Demo - Servicios no conectados
        </div>
      )}
    </div>
  );
}

/**
 * Badge de estado de servicio
 */
function StatusBadge({ activo, label }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
      activo 
        ? 'bg-green-950/50 text-green-400 border border-green-800/30' 
        : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'
    }`}>
      {activo ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {label}
    </div>
  );
}

/**
 * Botón de sugerencia
 */
function SugerenciaButton({ texto, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-3 py-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50 text-sm text-slate-300 transition"
    >
      {texto}
    </button>
  );
}
