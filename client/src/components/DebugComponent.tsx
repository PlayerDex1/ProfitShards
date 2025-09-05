import React from 'react';

export function DebugComponent() {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '20px',
      zIndex: 9999,
      fontSize: '16px',
      fontWeight: 'bold',
      border: '3px solid yellow',
      borderRadius: '10px',
      maxWidth: '300px'
    }}>
      <h3>🔍 DEBUG COMPONENT</h3>
      <p>✅ Este componente está funcionando!</p>
      <p>🕐 {new Date().toLocaleTimeString()}</p>
      <p>📍 Posição: fixed top-right</p>
    </div>
  );
}