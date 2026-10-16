// Página pública del Chat Multimodal
// Ruta: /chat

import { useState } from 'react';
import ChatLogin from '../components/chat-multimodal/ChatLogin';
import ChatMultimodal from '../components/chat-multimodal/ChatMultimodal';

export default function ChatPage() {
  const [authData, setAuthData] = useState(null);

  const handleLogin = (data) => {
    setAuthData(data);
  };

  const handleLogout = () => {
    setAuthData(null);
  };

  // Si no hay auth, mostrar login
  if (!authData) {
    return <ChatLogin onLogin={handleLogin} />;
  }

  // Si hay auth, mostrar chat
  return <ChatMultimodal authData={authData} onLogout={handleLogout} />;
}
