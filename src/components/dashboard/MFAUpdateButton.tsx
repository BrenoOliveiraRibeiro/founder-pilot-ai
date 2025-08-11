import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, Building } from 'lucide-react';
import { useOpenFinanceConnections } from '@/hooks/useOpenFinanceConnections';
import { useMFAHandler } from '@/hooks/useMFAHandler';
import { MFADialog } from '@/components/open-finance/MFADialog';
import { useToast } from '@/components/ui/use-toast';

export const MFAUpdateButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const { activeIntegrations, loading } = useOpenFinanceConnections();
  const { mfaState, loading: mfaLoading, checkMFAStatus, submitMFA, clearMFA } = useMFAHandler();
  const { toast } = useToast();

  const handleSelectIntegration = async (integrationId: string, itemId: string) => {
    setSelectedIntegration(integrationId);
    
    try {
      const needsMFA = await checkMFAStatus(itemId);
      
      if (!needsMFA) {
        toast({
          title: "Autenticação não necessária",
          description: "Esta conexão não requer autenticação MFA no momento.",
        });
        setIsOpen(false);
        setSelectedIntegration(null);
      }
    } catch (error) {
      setSelectedIntegration(null);
    }
  };

  const handleMFASuccess = () => {
    setIsOpen(false);
    setSelectedIntegration(null);
    clearMFA();
  };

  const handleMFASubmit = async (mfaData: { type: string; parameter?: string; value?: string }) => {
    await submitMFA(mfaData, handleMFASuccess);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedIntegration(null);
    clearMFA();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar MFA
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Atualizar Autenticação MFA
            </DialogTitle>
            <DialogDescription>
              Selecione uma conexão bancária para renovar a autenticação MFA
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Carregando conexões...</p>
              </div>
            ) : activeIntegrations.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma conexão bancária encontrada
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium">Conexões disponíveis:</p>
                {activeIntegrations.map((integration) => (
                  <Card 
                    key={integration.id} 
                    className="cursor-pointer transition-all hover:shadow-md border-border"
                    onClick={() => handleSelectIntegration(integration.id, integration.item_id || '')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{integration.nome_banco}</p>
                            <p className="text-xs text-muted-foreground">
                              {integration.tipo_conexao} • ID: {integration.item_id?.slice(-4) || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={integration.status === 'ATIVO' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {integration.status}
                          </Badge>
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MFA Dialog */}
      <MFADialog
        open={mfaState.isRequired}
        onClose={clearMFA}
        onSubmit={handleMFASubmit}
        mfaType={mfaState.type}
        mfaParameter={mfaState.parameter}
        qrCodeData={mfaState.qrCodeData}
        loading={mfaLoading}
      />
    </>
  );
};