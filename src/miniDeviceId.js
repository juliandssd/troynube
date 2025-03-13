// miniDeviceId.js - Versión ultra compacta
import { useState, useEffect } from 'react';

export const useDeviceSerial = () => {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar recuperar ID guardado
    let deviceId = localStorage.getItem('hwid');
    
    if (!deviceId) {
      // Crear fingerprint básico con propiedades estables entre navegadores
      const fingerprint = `${navigator.platform}-${screen.width}x${screen.height}-${screen.colorDepth}-${navigator.hardwareConcurrency || 0}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
      
      // Crear hash simple
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
        hash |= 0; // Convertir a entero de 32 bits
      }
      
      // Asegurar que sea positivo y convertir a hexadecimal
      deviceId = Math.abs(hash).toString(16);
      localStorage.setItem('hwid', deviceId);
    }
    
    setSerial(deviceId);
    setLoading(false);
  }, []);

  return { serial, loading };
};