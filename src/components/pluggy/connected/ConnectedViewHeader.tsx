
import React from 'react';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConnectedViewHeaderProps {
  processingTransactions: boolean;
}

export const ConnectedViewHeader = ({ processingTransactions }: ConnectedViewHeaderProps) => {
  return (
    <div className="mb-6">
      <Link to="/open-finance" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Open Finance
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conta Conectada</h1>
          <p className="text-gray-600">Dados bancários sincronizados via Pluggy OpenFinance</p>
          {processingTransactions && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Processando transações automaticamente...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
