// Detector de intención del usuario
// Analiza el mensaje para determinar qué modo usar

/**
 * Detecta la intención del mensaje del usuario
 * @param {string} mensaje - Mensaje del usuario
 * @returns {{modo: string, confianza: number, prompt: string}}
 */
export function detectarIntencion(mensaje) {
  const lower = mensaje.toLowerCase().trim();
  
  // Patrones para generación de video
  const patronesVideo = [
    /anim(a|ar|ación)/, /video/, /vídeo/, /movimiento/, /animar/,
    /genera.*video/, /crea.*video/, /haz.*video/
  ];
  
  // Patrones para generación de imagen
  const patronesImagen = [
    /genera.*imagen/, /crea.*imagen/, /dibuja/, /pinta/,
    /haz.*imagen/, /genera.*foto/, /crea.*foto/, /diseña/,
    /ilustra/, /renderiza/, /genera.*arte/, /crea.*arte/,
    /imagen de/, /foto de/, /dibujo de/, /pintura de/
  ];
  
  // Patrones para análisis de imagen
  const patronesAnalisis = [
    /analiza/, /describe/, /qué ves/, /que ves/, /explica.*imagen/,
    /qué hay en/, /que hay en/, /reconoce/, /identifica/,
    /dime qué/, /dime que/
  ];
  
  // Patrones para búsqueda en el hub
  const patronesBusqueda = [
    /busca/, /tienes/, /qué modelos/, /que modelos/,
    /cuántos/, /cuantos/, /lista de/, /disponible/,
    /qué hay/, /que hay/, /muestra.*modelo/
  ];
  
  // Verificar video primero (más específico)
  for (const patron of patronesVideo) {
    if (patron.test(lower)) {
      return { modo: 'video', confianza: 0.85, prompt: extraerPrompt(lower) };
    }
  }
  
  // Verificar análisis
  for (const patron of patronesAnalisis) {
    if (patron.test(lower)) {
      return { modo: 'analisis', confianza: 0.9, prompt: mensaje };
    }
  }
  
  // Verificar imagen
  for (const patron of patronesImagen) {
    if (patron.test(lower)) {
      return { modo: 'imagen', confianza: 0.9, prompt: extraerPrompt(lower) };
    }
  }
  
  // Verificar búsqueda
  for (const patron of patronesBusqueda) {
    if (patron.test(lower)) {
      return { modo: 'busqueda', confianza: 0.7, prompt: mensaje };
    }
  }
  
  // Por defecto: texto
  return { modo: 'texto', confianza: 0.5, prompt: mensaje };
}

/**
 * Extrae el prompt útil del mensaje (eliminando palabras de comando)
 */
function extraerPrompt(mensaje) {
  // Eliminar prefijos comunes de comando
  const cleaned = mensaje
    .replace(/^(genera|crea|dibuja|pinta|haz|diseña|ilustra|renderiza)\s*(una|un|me)?\s*(imagen|foto|dibujo|pintura|arte|ilustración)?\s*(de)?\s*/i, '')
    .replace(/^(de|sobre|acerca de)\s*/i, '')
    .trim();
  
  return cleaned || mensaje;
}

/**
 * Obtiene los modos disponibles según la configuración
 */
export function getModosDisponibles(config = {}) {
  const modos = [
    { id: 'auto', nombre: 'Auto', icono: '✨', descripcion: 'Detección automática' },
    { id: 'texto', nombre: 'Texto', icono: '💬', descripcion: 'Conversación' },
    { id: 'imagen', nombre: 'Imagen', icono: '🎨', descripcion: 'Generar imagen' },
    { id: 'video', nombre: 'Video', icono: '🎬', descripcion: 'Generar video' },
    { id: 'analisis', nombre: 'Análisis', icono: '🖼️', descripcion: 'Analizar imagen' },
  ];
  
  // Filtrar según modos permitidos por token
  if (config.modosPermitidos && config.modosPermitidos.length > 0) {
    return modos.filter(m => m.id === 'auto' || config.modosPermitidos.includes(m.id));
  }
  
  return modos;
}
