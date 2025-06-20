
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, CreditCard, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PluggyConnectionViewProps {
  isConnecting: boolean;
  isScriptLoaded: boolean;
  onConnect: () => void;
}

export const PluggyConnectionView = ({ 
  isConnecting, 
  isScriptLoaded, 
  onConnect 
}: PluggyConnectionViewProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/open-finance" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Open Finance
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://media.licdn.com/dms/image/v2/C560BAQGbP3joPjasLw/company-logo_200_200/company-logo_200_200/0/1630665861354/pluggyai_logo?e=2147483647&v=beta&t=k1PIBzxSkL0wxz2q1R4RcjhiZ3JQhnyQQom2NQtfk1Y" 
                alt="Pluggy" 
                className="w-10 h-10 rounded"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Conectar com Pluggy OpenFinance
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecte suas contas bancárias de forma segura usando o widget oficial da Pluggy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Segurança Total</h3>
              <p className="text-sm text-gray-600">
                Certificação OpenFinance com criptografia de ponta a ponta
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dados em Tempo Real</h3>
              <p className="text-sm text-gray-600">
                Sincronização automática de extratos e saldos
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Análises Avançadas</h3>
              <p className="text-sm text-gray-600">
                IA para insights financeiros e previsões de fluxo de caixa
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Conectar Conta Bancária
              </h2>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded mb-6">
                <Shield className="w-4 h-4 inline mr-2" />
                Widget oficial da Pluggy com certificação OpenFinance.
                Suas credenciais são processadas diretamente pelo banco.
              </div>
              <Button 
                onClick={onConnect}
                className="w-full" 
                disabled={isConnecting || !isScriptLoaded}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : !isScriptLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando widget...
                  </>
                ) : (
                  'Abrir Widget Pluggy Connect'
                )}
              </Button>
              {!isScriptLoaded && (
                <p className="text-sm text-gray-500 mt-2">
                  Carregando widget da Pluggy...
                </p>
              )}
            </Card>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              <strong>Nota:</strong> Widget oficial da Pluggy com certificação OpenFinance.
              Todas as conexões são seguras e criptografadas. As transações são salvas automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
