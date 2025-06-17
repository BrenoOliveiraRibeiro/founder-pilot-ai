
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const RealtimeStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Verificar status inicial
    const checkConnection = () => {
      // Simular verificação de conexão
      setIsConnected(true);
    };

    checkConnection();

    // Escutar mudanças de status do canal
    const channel = supabase.channel('connection-status');
    
    channel.on('system', { event: 'online' }, () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    });
    
    channel.on('system', { event: 'offline' }, () => {
      setIsConnected(false);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <WifiOff size={16} />
        <span className="text-sm font-medium">Desconectado</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Wifi size={16} />
      </motion.div>
      <span className="text-sm font-medium">
        Tempo real ativo
        {lastUpdate && (
          <span className="block text-xs opacity-80">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </span>
    </motion.div>
  );
};
