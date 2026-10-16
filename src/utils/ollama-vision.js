// Comunicación con Ollama para análisis de imágenes (Vision Language Models)
// Modelos compatibles: llava, llava:13b, qwen-vl, bakllava

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';

/**
 * Analiza una imagen usando un modelo de visión de Ollama
 * @param {string} imagenBase64 - Imagen en formato base64 (con o sin prefijo data:)
 * @param {string} prompt - Pregunta/prompt sobre la imagen
 * @param {string} modelo - Modelo VLM a usar
 * @returns {Promise<Object>} Análisis de la imagen
 */
export async function analizarImagenOllama(imagenBase64, prompt = 'Describe esta imagen en detalle', modelo = 'llava:13b') {
  const promptSistema = `Eres un experto en análisis de imágenes. Describe la imagen en detalle en español.
Incluye: sujeto principal, estilo artístico, colores dominantes, composición, atmósfera.
Sé conciso pero descriptivo (máximo 150 palabras).`;

  // Limpiar el base64 (quitar prefijo data: si existe)
  const base64Clean = imagenBase64.includes(',') 
    ? imagenBase64.split(',')[1] 
    : imagenBase64;

  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelo,
        prompt: `${promptSistema}\n\nPregunta del usuario: ${prompt}`,
        images: [base64Clean],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const tiempoRespuesta = (Date.now() - startTime) / 1000;

    return {
      tipo: 'analisis_imagen',
      contenido: data.response,
      modelo_usado: modelo,
      tiempo_respuesta_seg: tiempoRespuesta,
      prompt_usuario: prompt
    };
  } catch (error) {
    console.error('Error análisis imagen:', error);
    return simularAnalisisImagen(prompt);
  }
}

/**
 * Simula análisis cuando el modelo VLM no está disponible
 */
function simularAnalisisImagen(prompt) {
  return {
    tipo: 'analisis_imagen',
    contenido: `📋 **Análisis simulado**\n\nEn modo simulación (modelo VLM no disponible), analizaría tu imagen buscando:\n\n- **Sujeto principal**: Detección de objetos y personas\n- **Estilo**: Artístico, fotográfico, digital\n- **Colores**: Paleta dominante\n- **Composición**: Regla de tercios, simetría\n- **Atmósfera**: Estado de ánimo general\n\n*Para análisis real, instala un modelo VLM:*\n\`\`\`\nollama pull llava:13b\n\`\`\``,
    modelo_usado: 'simulación',
    tiempo_respuesta_seg: 1.2,
    prompt_usuario: prompt,
    simulado: true
  };
}

/**
 * Obtiene modelos de visión disponibles
 */
export async function obtenerModelosVision() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    // Filtrar modelos de visión
    return (data.models || []).filter(m => 
      m.name.includes('llava') || 
      m.name.includes('qwen-vl') || 
      m.name.includes('bakllava') ||
      m.name.includes('moondream')
    );
  } catch {
    return [];
  }
}
