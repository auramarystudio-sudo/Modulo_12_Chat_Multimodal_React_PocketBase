// Comunicación con Ollama para chat de texto
// Endpoint: http://127.0.0.1:11434/api/chat

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';

/**
 * Envía un mensaje al modelo de texto de Ollama
 * @param {string} mensaje - Mensaje del usuario
 * @param {Array} historial - Historial de mensajes
 * @param {string} modelo - Modelo a usar
 * @returns {Promise<Object>} Respuesta del modelo
 */
export async function enviarMensajeOllama(mensaje, historial = [], modelo = 'llama3.1:8b') {
  const systemPrompt = `Eres un asistente experto en IA generativa local. 
Tienes acceso a modelos de Stable Diffusion, LLMs, y herramientas de generación de video.
Responde en español de forma clara y concisa.
Si te piden generar imágenes o videos, indica que lo harás y usa el modo correspondiente.
Puedes usar formato Markdown básico en tus respuestas.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historial.slice(-10).map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.contenido
    })),
    { role: 'user', content: mensaje }
  ];

  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelo,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const tiempoRespuesta = (Date.now() - startTime) / 1000;

    return {
      tipo: 'texto_ia',
      contenido: data.message.content,
      modelo_usado: modelo,
      tiempo_respuesta_seg: tiempoRespuesta,
      tokens_usados: (data.prompt_eval_count || 0) + (data.eval_count || 0)
    };
  } catch (error) {
    console.error('Error Ollama chat:', error);
    // Simulación cuando Ollama no está disponible
    return simularRespuestaTexto(mensaje, historial);
  }
}

/**
 * Obtiene la lista de modelos disponibles en Ollama
 */
export async function obtenerModelosOllama() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('No disponible');
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.warn('No se pudo obtener modelos de Ollama');
    return [];
  }
}

/**
 * Simula una respuesta cuando Ollama no está disponible
 */
function simularRespuestaTexto(mensaje, historial) {
  const respuestas = [
    `¡Hola! Soy tu asistente de IA local. Puedo ayudarte con:\n\n- 💬 **Conversación** - Habla conmigo sobre lo que quieras\n- 🎨 **Generar imágenes** - Pídeme que cree una imagen\n- 🎬 **Generar videos** - Anima tus imágenes\n- 🖼️ **Analizar imágenes** - Sube una imagen y pregúntame\n\n*Nota: Ollama no está disponible actualmente, estoy en modo simulación.*`,
    `Entiendo tu mensaje: "${mensaje}"\n\nActualmente estoy en modo simulación porque Ollama no está disponible. Para respuestas reales, asegúrate de tener Ollama corriendo con:\n\`\`\`\nollama serve\n\`\`\``,
    `Interesante pregunta. En modo simulación no puedo procesar tu solicitud completa, pero cuando Ollama esté activo podré darte respuestas detalladas usando modelos como Llama 3.1, Mistral, etc.`
  ];
  
  return {
    tipo: 'texto_ia',
    contenido: respuestas[Math.floor(Math.random() * respuestas.length)],
    modelo_usado: 'simulación',
    tiempo_respuesta_seg: 0.5,
    tokens_usados: 0,
    simulado: true
  };
}
