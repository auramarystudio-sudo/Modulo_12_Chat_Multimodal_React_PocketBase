// Motor principal de enrutamiento del chat
// Decide qué servicio usar según la intención detectada

import { detectarIntencion } from './intent-detector';
import { enviarMensajeOllama } from './ollama-chat';
import { analizarImagenOllama } from './ollama-vision';
import { generarImagenA1111 } from './a1111-api';
import { generarVideoComfyUI } from './comfyui-api';

/**
 * Procesa un mensaje del usuario y enruta al servicio correspondiente
 * @param {string} mensaje - Mensaje del usuario
 * @param {Object} contexto - Contexto de la conversación
 * @param {File|null} archivoAdjunto - Archivo adjunto (imagen para análisis)
 * @returns {Promise<Object>} Respuesta procesada
 */
export async function procesarMensaje(mensaje, contexto, archivoAdjunto = null) {
  const intencion = detectarIntencion(mensaje);
  const modo = contexto.modoForzado !== 'auto' 
    ? contexto.modoForzado 
    : intencion.modo;

  console.log(`[Chat Engine] Modo: ${modo} | Confianza: ${intencion.confianza}`);

  try {
    switch (modo) {
      case 'texto':
        return await procesarTexto(mensaje, contexto);
      
      case 'imagen':
        return await procesarImagen(mensaje, contexto);
      
      case 'video':
        return await procesarVideo(mensaje, contexto, archivoAdjunto);
      
      case 'analisis':
        return await procesarAnalisis(mensaje, contexto, archivoAdjunto);
      
      case 'busqueda':
        return await procesarBusqueda(mensaje, contexto);
      
      default:
        return await procesarTexto(mensaje, contexto);
    }
  } catch (error) {
    console.error('[Chat Engine] Error:', error);
    return {
      tipo: 'error',
      contenido: `Error procesando mensaje: ${error.message}`,
      modo_usado: modo
    };
  }
}

/**
 * Procesa mensaje de texto con Ollama
 */
async function procesarTexto(mensaje, contexto) {
  const resultado = await enviarMensajeOllama(
    mensaje, 
    contexto.historial || [], 
    contexto.modeloTexto || 'llama3.1:8b'
  );
  return { ...resultado, modo_usado: 'texto' };
}

/**
 * Procesa generación de imagen con A1111
 */
async function procesarImagen(mensaje, contexto) {
  const intencion = detectarIntencion(mensaje);
  const prompt = intencion.prompt || mensaje;
  
  const resultado = await generarImagenA1111(prompt, {
    ...contexto.parametrosImagen,
    negative_prompt: contexto.parametrosImagen?.negative_prompt || 'low quality, blurry, deformed',
    steps: contexto.parametrosImagen?.steps || 20,
    cfg_scale: contexto.parametrosImagen?.cfg_scale || 7,
    width: contexto.parametrosImagen?.width || 512,
    height: contexto.parametrosImagen?.height || 512
  });
  
  return { ...resultado, modo_usado: 'imagen' };
}

/**
 * Procesa generación de video con ComfyUI
 */
async function procesarVideo(mensaje, contexto, archivoAdjunto) {
  // Si hay archivo adjunto, usar img2vid
  if (archivoAdjunto) {
    const base64 = await archivoABase64(archivoAdjunto);
    const resultado = await generarVideoComfyUI(base64, contexto.parametrosVideo);
    return { ...resultado, modo_usado: 'video' };
  }
  
  // Si no hay imagen, primero generar una y luego animar
  return {
    tipo: 'texto_ia',
    contenido: '🎬 Para generar un video, necesito una imagen de partida. Sube una imagen primero y luego pídeme que la anime.',
    modo_usado: 'video'
  };
}

/**
 * Procesa análisis de imagen con Ollama VLM
 */
async function procesarAnalisis(mensaje, contexto, archivoAdjunto) {
  if (!archivoAdjunto) {
    return {
      tipo: 'error',
      contenido: '📎 Necesito una imagen para analizar. Sube una imagen usando el botón adjuntar.',
      modo_usado: 'analisis'
    };
  }
  
  const base64 = await archivoABase64(archivoAdjunto);
  const resultado = await analizarImagenOllama(
    base64, 
    mensaje, 
    contexto.modeloVision || 'llava:13b'
  );
  
  return { 
    ...resultado, 
    modo_usado: 'analisis',
    imagen_adjunta: base64
  };
}

/**
 * Procesa búsqueda en el hub
 */
async function procesarBusqueda(mensaje, contexto) {
  // Simulación de búsqueda en el hub
  return {
    tipo: 'texto_ia',
    contenido: `🔍 **Búsqueda en el Hub**\n\nTu consulta: "${mensaje}"\n\nEl módulo de búsqueda del hub permite consultar:\n- Modelos disponibles (checkpoints, LoRAs)\n- Tutoriales y guías\n- Configuraciones guardadas\n\n*Esta funcionalidad requiere conexión con el módulo Hub principal.*`,
    modo_usado: 'texto'
  };
}

/**
 * Convierte un archivo a base64
 */
function archivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}

/**
 * Obtiene el contexto actualizado para el motor
 */
export function crearContextoChat(config = {}) {
  return {
    modoForzado: config.modoForzado || 'auto',
    historial: config.historial || [],
    modeloTexto: config.modeloTexto || 'llama3.1:8b',
    modeloVision: config.modeloVision || 'llava:13b',
    parametrosImagen: config.parametrosImagen || {},
    parametrosVideo: config.parametrosVideo || {},
    sessionId: config.sessionId || null
  };
}
