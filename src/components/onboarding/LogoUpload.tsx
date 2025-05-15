
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LogoUploadProps {
  onLogoChange: (file: File | null, previewUrl: string) => void;
  existingLogo?: string;
  isMobile?: boolean;
  isSafariIOS?: boolean;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ 
  onLogoChange, 
  existingLogo, 
  isMobile, 
  isSafariIOS 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(existingLogo || '');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, SVG ou GIF).",
        variant: "destructive",
      });
      return;
    }

    // Verificar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    onLogoChange(file, fileUrl);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl('');
    onLogoChange(null, '');
  };

  // Estilo específico para iOS Safari
  const iosSafariStyles = isSafariIOS 
    ? "tap-highlight-transparent active:opacity-70" 
    : "";

  return (
    <div className="space-y-4">
      <div className={`flex flex-col items-center p-4 border-2 border-dashed rounded-md ${iosSafariStyles}`}>
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Logo preview" 
              className="object-contain w-40 h-40"
            />
            <button 
              type="button" 
              onClick={handleRemoveLogo}
              className={`absolute top-0 right-0 p-2 bg-red-500 rounded-full text-white ${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`}
              aria-label="Remover logo"
            >
              <X className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-6">
              {isMobile ? (
                <Camera className="h-12 w-12 text-muted-foreground mb-3" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-center text-muted-foreground px-2">
                {isUploading ? "Enviando..." : (isMobile 
                  ? "Toque para selecionar ou tirar uma foto" 
                  : "Arraste e solte ou clique para fazer upload da sua logo")}
              </p>
            </div>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              capture={isMobile ? "environment" : undefined}
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={isUploading}
              className={`w-full ${isMobile ? 'text-base py-6' : ''} ${iosSafariStyles}`}
            >
              {isMobile ? "Selecionar ou tirar foto" : "Selecionar arquivo"}
            </Button>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Formatos aceitos: PNG, JPG, SVG ou GIF. Tamanho máximo: 5MB.
      </p>
    </div>
  );
};
