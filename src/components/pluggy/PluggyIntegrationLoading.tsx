
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PluggyIntegrationLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Carregando...</span>
      </div>
    </div>
  );
};
