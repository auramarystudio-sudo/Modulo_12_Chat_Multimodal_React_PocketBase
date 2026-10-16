// Gestor de tokens de acceso compartido
// Permite generar y validar tokens para acceso remoto al chat

import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un nuevo token de acceso
 */
export function generarToken() {
  return `chat_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
}

/**
 * Valida el formato de un token
 */
export function validarFormatoToken(token) {
  return /^chat_[a-f0-9]{24}$/.test(token);
}

/**
 * Crea la configuración de un nuevo token
 */
export function crearConfigToken(nombre, descripcion = '', opciones = {}) {
  return {
    token: generarToken(),
    nombre,
    descripcion,
    activo: true,
    fecha_expiracion: opciones.expiracion || null,
    max_usos: opciones.maxUsos || null,
    usos_actuales: 0,
    modos_permitidos: opciones.modosPermitidos || ['texto', 'imagen', 'video', 'analisis'],
    creado_por: opciones.creadoPor || null,
    creado_en: new Date().toISOString()
  };
}

/**
 * Verifica si un token es válido (sin PocketBase)
 */
export function verificarTokenLocal(token, tokensGuardados = []) {
  const tokenData = tokensGuardados.find(t => t.token === token);
  
  if (!tokenData) {
    return { valido: false, error: 'Token no encontrado' };
  }
  
  if (!tokenData.activo) {
    return { valido: false, error: 'Token desactivado' };
  }
  
  if (tokenData.fecha_expiracion && new Date(tokenData.fecha_expiracion) < new Date()) {
    return { valido: false, error: 'Token expirado' };
  }
  
  if (tokenData.max_usos && tokenData.usos_actuales >= tokenData.max_usos) {
    return { valido: false, error: 'Token agotado' };
  }
  
  return { valido: true, data: tokenData };
}
