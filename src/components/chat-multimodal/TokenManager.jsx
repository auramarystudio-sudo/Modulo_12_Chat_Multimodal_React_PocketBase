// Gestor de tokens (panel admin)
// Permite crear, ver y eliminar tokens de acceso

import { useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Shield, X } from 'lucide-react';
import { generarToken, crearConfigToken } from '../../utils/token-manager';

export default function TokenManager({ tokens, onCrearToken, onEliminarToken, visible, onClose }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modosPermitidos, setModosPermitidos] = useState(['texto', 'imagen', 'video', 'analisis']);
  const [maxUsos, setMaxUsos] = useState('');
  const [copiado, setCopiado] = useState(null);

  if (!visible) return null;

  const handleCrear = () => {
    if (!nombre.trim()) return;
    
    const config = crearConfigToken(nombre.trim(), descripcion.trim(), {
      modosPermitidos,
      maxUsos: maxUsos ? parseInt(maxUsos) : null
    });
    
    onCrearToken(config);
    setNombre('');
    setDescripcion('');
    setMaxUsos('');
  };

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  const toggleModo = (modo) => {
    setModosPermitidos(prev => 
      prev.includes(modo) 
        ? prev.filter(m => m !== modo)
        : [...prev, modo]
    );
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl z-50 flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tokens de Acceso
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Formulario crear token */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Nuevo Token
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del token"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción (opcional)"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
              
              {/* Modos permitidos */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Modos permitidos</label>
                <div className="flex flex-wrap gap-2">
                  {['texto', 'imagen', 'video', 'analisis'].map(modo => (
                    <button
                      key={modo}
                      onClick={() => toggleModo(modo)}
                      className={`px-2 py-1 rounded-md text-xs transition ${
                        modosPermitidos.includes(modo)
                          ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'
                      }`}
                    >
                      {modo}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                value={maxUsos}
                onChange={(e) => setMaxUsos(e.target.value)}
                placeholder="Máximo de usos (vacío = ilimitado)"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />

              <button
                onClick={handleCrear}
                disabled={!nombre.trim()}
                className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                Generar Token
              </button>
            </div>
          </div>

          {/* Lista de tokens */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Tokens existentes ({tokens.length})
            </h3>
            
            {tokens.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No hay tokens creados
              </p>
            ) : (
              <div className="space-y-2">
                {tokens.map((tokenData) => (
                  <div key={tokenData.token} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-200">{tokenData.nombre}</span>
                      <button
                        onClick={() => onEliminarToken(tokenData.token)}
                        className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded font-mono truncate">
                        {tokenData.token}
                      </code>
                      <button
                        onClick={() => handleCopy(tokenData.token)}
                        className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50 transition"
                      >
                        {copiado === tokenData.token ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {tokenData.descripcion && (
                        <span className="text-xs text-slate-500">{tokenData.descripcion}</span>
                      )}
                      <span className="text-xs text-slate-600">
                        {tokenData.usos_actuales || 0} usos
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${tokenData.activo ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'}`}>
                        {tokenData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
