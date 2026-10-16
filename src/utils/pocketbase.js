// Configuración de PocketBase - Cliente de base de datos
import PocketBase from 'pocketbase';

// URL del servidor PocketBase (ajustar según entorno)
const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

// Instancia global de PocketBase
const pb = new PocketBase(PB_URL);

// Auto-refresh del token de autenticación
pb.autoCancellation(false);

/**
 * Verifica si PocketBase está disponible
 */
export async function verificarConexion() {
  try {
    await pb.health.check();
    return true;
  } catch (error) {
    console.warn('PocketBase no disponible:', error.message);
    return false;
  }
}

/**
 * Obtiene la instancia de PocketBase
 */
export function getPb() {
  return pb;
}

/**
 * Inicia sesión como admin
 */
export async function loginAdmin(email, password) {
  try {
    const authData = await pb.admins.authWithPassword(email, password);
    return authData;
  } catch (error) {
    console.error('Error login admin:', error);
    throw error;
  }
}

/**
 * Autentica con token de acceso compartido
 */
export async function autenticarConToken(token) {
  try {
    // Busca el token en la colección chat_tokens
    const record = await pb.collection('chat_tokens').getFirstListItem(`token="${token}"`);
    
    if (!record.activo) {
      throw new Error('Token desactivado');
    }
    
    if (record.fecha_expiracion && new Date(record.fecha_expiracion) < new Date()) {
      throw new Error('Token expirado');
    }
    
    if (record.max_usos && record.usos_actuales >= record.max_usos) {
      throw new Error('Token agotado (máximo de usos alcanzado)');
    }
    
    // Incrementa contador de usos
    await pb.collection('chat_tokens').update(record.id, {
      usos_actuales: (record.usos_actuales || 0) + 1
    });
    
    return record;
  } catch (error) {
    console.error('Error autenticando token:', error);
    throw error;
  }
}

export default pb;
