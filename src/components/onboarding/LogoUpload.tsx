
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LogoUploadProps {
  onLogoChange: (file: File | null, previewUrl: string) => void;
  existingLogo?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, existingLogo }) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
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
              className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white"
              aria-label="Remover logo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-6">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                {isUploading ? "Enviando..." : "Arraste e solte ou clique para fazer upload da sua logo"}
              </p>
            </div>
            <Input
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/gif"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={isUploading}
              className="w-full"
            >
              Selecionar arquivo
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
