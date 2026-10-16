// Comunicación con ComfyUI API
// Endpoint: http://127.0.0.1:8188/
// Para generación avanzada de imágenes y videos

const COMFYUI_URL = import.meta.env.VITE_COMFYUI_URL || 'http://127.0.0.1:8188';

/**
 * Genera video usando SVD (Stable Video Diffusion) en ComfyUI
 * @param {string} imagenBase64 - Imagen de entrada (para img2vid)
 * @param {Object} parametros - Parámetros de generación
 * @returns {Promise<Object>} Video generado
 */
export async function generarVideoComfyUI(imagenBase64, parametros = {}) {
  const {
    frames = 14,
    fps = 8,
    motion_bucket_id = 127,
    augmentation_level = 0.1,
    seed = -1
  } = parametros;

  const startTime = Date.now();

  try {
    // Crear workflow de ComfyUI para SVD
    const workflow = crearWorkflowSVD(imagenBase64, {
      frames, fps, motion_bucket_id, augmentation_level, seed
    });

    // Enviar workflow a ComfyUI
    const response = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const promptId = data.prompt_id;

    // Esperar a que termine la generación
    const resultado = await esperarComfyUI(promptId);
    const tiempoGeneracion = (Date.now() - startTime) / 1000;

    return {
      tipo: 'video_generado',
      contenido: `Video generado (${frames} frames a ${fps} FPS)`,
      video_url: resultado.video_url,
      video_base64: resultado.video_base64,
      parametros: { frames, fps, motion_bucket_id, seed },
      tiempo_generacion: tiempoGeneracion,
      modelo_usado: 'ComfyUI SVD'
    };
  } catch (error) {
    console.error('Error ComfyUI video:', error);
    return simularVideo(parametros);
  }
}

/**
 * Crea el workflow de ComfyUI para SVD
 */
function crearWorkflowSVD(imagenBase64, params) {
  const base64Clean = imagenBase64.includes(',') 
    ? imagenBase64.split(',')[1] 
    : imagenBase64;

  return {
    "1": {
      class_type: "LoadImage",
      inputs: { image: base64Clean }
    },
    "2": {
      class_type: "SVD_img2vid_Conditioning",
      inputs: {
        init_image: ["1", 0],
        video_frames: params.frames,
        fps: params.fps,
        motion_bucket_id: params.motion_bucket_id,
        augmentation_level: params.augmentation_level
      }
    },
    "3": {
      class_type: "KSampler",
      inputs: {
        seed: params.seed === -1 ? Math.floor(Math.random() * 999999999) : params.seed,
        steps: 20,
        cfg: 2.5,
        sampler_name: "euler",
        scheduler: "karras",
        denoise: 1.0
      }
    },
    "4": {
      class_type: "VHS_VideoCombine",
      inputs: {
        frame_rate: params.fps,
        loop_count: 0,
        format: "image/gif"
      }
    }
  };
}

/**
 * Espera a que ComfyUI termine de procesar
 */
async function esperarComfyUI(promptId, maxWait = 120000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);
      if (response.ok) {
        const data = await response.json();
        if (data[promptId]?.outputs) {
          return { completado: true, outputs: data[promptId].outputs };
        }
      }
    } catch (e) { /* reintentar */ }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Timeout esperando ComfyUI');
}

/**
 * Simula generación de video
 */
function simularVideo(parametros = {}) {
  return {
    tipo: 'video_generado',
    contenido: `🎬 **Video simulado**\n\nParámetros:\n- Frames: ${parametros.frames || 14}\n- FPS: ${parametros.fps || 8}\n\n*Modo simulación - ComfyUI no disponible.*\n\nPara generación real, inicia ComfyUI:\n\`\`\`\ncd ComfyUI\npython main.py\n\`\`\``,
    video_url: null,
    video_base64: null,
    parametros: { frames: 14, fps: 8 },
    tiempo_generacion: 0.1,
    modelo_usado: 'simulación',
    simulado: true
  };
}

/**
 * Verifica si ComfyUI está disponible
 */
export async function verificarComfyUI() {
  try {
    const response = await fetch(`${COMFYUI_URL}/system_stats`);
    return response.ok;
  } catch {
    return false;
  }
}
