// App principal - Router y layout
// Punto de entrada de la aplicación

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatMultimodal';
import ChatAdmin from './pages/ChatAdmin';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Ruta principal del chat */}
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Ruta de administración */}
        <Route path="/chat-admin" element={<ChatAdmin />} />
        
        {/* Redirigir raíz al chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
