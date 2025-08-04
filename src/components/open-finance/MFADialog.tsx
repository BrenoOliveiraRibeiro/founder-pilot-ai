import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield, Smartphone, QrCode, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MFADialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mfaData: { type: string; parameter?: string; value?: string }) => Promise<void>;
  mfaType: string;
  mfaParameter?: string;
  qrCodeData?: string;
  loading?: boolean;
}

export const MFADialog = ({
  open,
  onClose,
  onSubmit,
  mfaType,
  mfaParameter,
  qrCodeData,
  loading = false
}: MFADialogProps) => {
  const [mfaValue, setMfaValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setMfaValue('');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!mfaValue.trim() && mfaType !== 'qr_code') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o código solicitado.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type: mfaType,
        parameter: mfaParameter,
        value: mfaType === 'qr_code' ? undefined : mfaValue
      });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSubmitting(false);
    }
  };

  const handleQRCodeCompleted = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        type: 'qr_code_completed'
      });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSubmitting(false);
    }
  };

  const getMFAIcon = () => {
    switch (mfaType) {
      case 'qr_code':
        return <QrCode className="w-6 h-6 text-primary" />;
      case 'token':
        return <Key className="w-6 h-6 text-primary" />;
      case 'sms':
        return <Smartphone className="w-6 h-6 text-primary" />;
      default:
        return <Shield className="w-6 h-6 text-primary" />;
    }
  };

  const getMFATitle = () => {
    switch (mfaType) {
      case 'qr_code':
        return 'Autenticação via QR Code';
      case 'token':
        return 'Token de Autenticação';
      case 'sms':
        return 'Código SMS';
      case 'password':
        return 'Senha Adicional';
      default:
        return 'Autenticação Adicional';
    }
  };

  const getMFADescription = () => {
    switch (mfaType) {
      case 'qr_code':
        return 'Escaneie o QR Code abaixo com o aplicativo do seu banco e confirme a autenticação.';
      case 'token':
        return 'Digite o token gerado pelo seu dispositivo de autenticação ou aplicativo do banco.';
      case 'sms':
        return 'Digite o código que foi enviado por SMS para o seu telefone cadastrado.';
      case 'password':
        return 'Digite sua senha adicional conforme solicitado pelo banco.';
      default:
        return 'Complete a autenticação adicional conforme solicitado pelo seu banco.';
    }
  };

  const renderMFAContent = () => {
    if (mfaType === 'qr_code') {
      return (
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  {qrCodeData ? (
                    <img 
                      src={`data:image/png;base64,${qrCodeData}`} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        QR Code será exibido aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  1. Abra o aplicativo do seu banco
                </p>
                <p className="text-sm font-medium">
                  2. Escaneie o QR Code acima
                </p>
                <p className="text-sm font-medium">
                  3. Confirme a autenticação no app
                </p>
                <p className="text-sm font-medium">
                  4. Clique em "Autenticação Concluída" abaixo
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting || loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQRCodeCompleted}
              disabled={submitting || loading}
              className="flex-1"
            >
              {submitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Autenticação Concluída'
              )}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="mfa-input" className="text-sm font-medium">
            {mfaParameter || 'Código de Autenticação'}
          </Label>
          <Input
            id="mfa-input"
            type={mfaType === 'password' ? 'password' : 'text'}
            value={mfaValue}
            onChange={(e) => setMfaValue(e.target.value)}
            placeholder={`Digite o ${mfaType === 'token' ? 'token' : 'código'} aqui...`}
            disabled={submitting || loading}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mfaValue.trim()) {
                handleSubmit();
              }
            }}
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting || loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading || !mfaValue.trim()}
            className="flex-1"
          >
            {submitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {getMFAIcon()}
            <DialogTitle className="text-lg">
              {getMFATitle()}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {getMFADescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {renderMFAContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};