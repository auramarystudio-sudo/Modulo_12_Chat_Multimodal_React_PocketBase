// Comunicación con Automatic1111 (A1111) WebUI API
// Endpoint: http://127.0.0.1:7860/sdapi/v1/
// Requiere iniciar A1111 con flag --api

const A1111_URL = import.meta.env.VITE_A1111_URL || 'http://127.0.0.1:7860';

/**
 * Genera una imagen usando txt2img de A1111
 * @param {string} prompt - Prompt de generación
 * @param {Object} parametros - Parámetros de generación
 * @returns {Promise<Object>} Imagen generada
 */
export async function generarImagenA1111(prompt, parametros = {}) {
  const {
    negative_prompt = 'low quality, blurry, deformed, ugly, bad anatomy',
    steps = 20,
    cfg_scale = 7,
    sampler = 'DPM++ 2M Karras',
    width = 512,
    height = 512,
    seed = -1,
    batch_size = 1
  } = parametros;

  const startTime = Date.now();

  try {
    const response = await fetch(`${A1111_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        negative_prompt,
        steps,
        cfg_scale,
        sampler_name: sampler,
        width,
        height,
        seed,
        batch_size,
        send_images: true,
        save_images: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const tiempoGeneracion = (Date.now() - startTime) / 1000;
    const base64Image = data.images[0];
    
    // Parsear info si está disponible
    let info = {};
    try {
      info = JSON.parse(data.info);
    } catch (e) { /* info opcional */ }

    return {
      tipo: 'imagen_generada',
      contenido: `Imagen generada con el prompt: "${prompt}"`,
      imagen_base64: `data:image/png;base64,${base64Image}`,
      parametros: {
        steps,
        cfg_scale,
        sampler,
        width,
        height,
        seed: info.seed || seed,
        negative_prompt
      },
      tiempo_generacion: tiempoGeneracion,
      modelo_usado: 'A1111 txt2img'
    };
  } catch (error) {
    console.error('Error A1111:', error);
    return simularImagen(prompt, parametros);
  }
}

/**
 * Genera una imagen usando img2img (imagen a imagen)
 */
export async function generarImagenImg2Img(prompt, imagenBase64, parametros = {}) {
  const {
    negative_prompt = 'low quality, blurry',
    steps = 20,
    cfg_scale = 7,
    sampler = 'DPM++ 2M Karras',
    denoising_strength = 0.75,
    width = 512,
    height = 512,
    seed = -1
  } = parametros;

  const base64Clean = imagenBase64.includes(',') 
    ? imagenBase64.split(',')[1] 
    : imagenBase64;

  try {
    const response = await fetch(`${A1111_URL}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        negative_prompt,
        init_images: [base64Clean],
        steps,
        cfg_scale,
        sampler_name: sampler,
        denoising_strength,
        width,
        height,
        seed
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    return {
      tipo: 'imagen_generada',
      contenido: `Imagen img2img con prompt: "${prompt}"`,
      imagen_base64: `data:image/png;base64,${data.images[0]}`,
      parametros: { steps, cfg_scale, sampler, denoising_strength, seed },
      modelo_usado: 'A1111 img2img'
    };
  } catch (error) {
    console.error('Error img2img:', error);
    return simularImagen(prompt, parametros);
  }
}

/**
 * Obtiene los modelos/checkpoints disponibles
 */
export async function obtenerModelosA1111() {
  try {
    const response = await fetch(`${A1111_URL}/sdapi/v1/sd-models`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Obtiene los samplers disponibles
 */
export async function obtenerSamplers() {
  try {
    const response = await fetch(`${A1111_URL}/sdapi/v1/samplers`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Simula generación de imagen cuando A1111 no está disponible
 */
function simularImagen(prompt, parametros = {}) {
  // Generar un placeholder SVG como imagen simulada
  const svgPlaceholder = generatePlaceholderSVG(prompt);
  
  return {
    tipo: 'imagen_generada',
    contenido: `🎨 **Imagen simulada**\n\nPrompt: "${prompt}"\n\n*Modo simulación - A1111 no disponible.*\n\nPara generación real, inicia A1111 con:\n\`\`\`\npython launch.py --api\n\`\`\``,
    imagen_base64: svgPlaceholder,
    parametros: {
      steps: parametros.steps || 20,
      cfg_scale: parametros.cfg_scale || 7,
      sampler: parametros.sampler || 'DPM++ 2M Karras',
      width: parametros.width || 512,
      height: parametros.height || 512,
      seed: Math.floor(Math.random() * 999999999)
    },
    tiempo_generacion: 0.1,
    modelo_usado: 'simulación',
    simulado: true
  };
}

/**
 * Genera un SVG placeholder con el prompt
 */
function generatePlaceholderSVG(prompt) {
  const shortPrompt = prompt.substring(0, 50);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b"/>
        <stop offset="50%" style="stop-color:#312e81"/>
        <stop offset="100%" style="stop-color:#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <text x="256" y="240" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="sans-serif">Imagen Simulada</text>
    <text x="256" y="270" text-anchor="middle" fill="#64748b" font-size="11" font-family="sans-serif">${shortPrompt}</text>
    <text x="256" y="300" text-anchor="middle" fill="#475569" font-size="10" font-family="sans-serif">A1111 no disponible</text>
  </svg>`;
  
  // Codificar UTF-8 correctamente para btoa (que solo acepta Latin1)
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}
