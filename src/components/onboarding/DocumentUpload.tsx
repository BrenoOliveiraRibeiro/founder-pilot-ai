
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploadProps {
  onDocumentChange: (file: File) => void;
  documents: Array<{ file: File, preview?: string }>;
  onRemoveDocument: (index: number) => void;
  isMobile?: boolean;
  isSafariIOS?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onDocumentChange, 
  documents,
  onRemoveDocument,
  isMobile,
  isSafariIOS
}) => {
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Adicionar cada arquivo selecionado
    Array.from(files).forEach(file => {
      // Verificar tipo de arquivo
      const acceptedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo nos formatos aceitos (PDF, DOC, XLS, PPT).",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 10MB por arquivo.",
          variant: "destructive",
        });
        return;
      }
      
      onDocumentChange(file);
    });
    
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Estilo específico para iOS Safari
  const iosSafariStyles = isSafariIOS 
    ? "tap-highlight-transparent active:opacity-70" 
    : "";

  return (
    <div className="space-y-4">
      <div className={`flex flex-col p-4 border-2 border-dashed rounded-md ${iosSafariStyles}`}>
        <div className="flex flex-col items-center justify-center py-6">
          {isMobile ? (
            <Upload className="h-12 w-12 text-muted-foreground mb-3" />
          ) : (
            <File className="h-10 w-10 text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-center text-muted-foreground px-2">
            {isMobile
              ? "Toque para adicionar documentos"
              : "Arraste e solte ou clique para adicionar pitch deck, planilhas ou documentos"}
          </p>
        </div>
        <Input
          id="document-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => document.getElementById('document-upload')?.click()}
          className={`w-full ${isMobile ? 'text-base py-6' : ''} ${iosSafariStyles}`}
        >
          {isMobile ? "Selecionar documentos" : "Selecionar arquivos"}
        </Button>
      </div>
      
      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Arquivos selecionados</h4>
          <div className={`max-h-${isMobile ? '40' : '60'} overflow-y-auto`}>
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 border rounded-md mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{doc.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(doc.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className={`text-red-500 ${isMobile ? 'h-10 w-10 p-0' : 'h-8 w-8 p-0'} ${iosSafariStyles}`}
                  onClick={() => onRemoveDocument(index)}
                  aria-label="Remover documento"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground text-center">
        Formatos aceitos: PDF, DOC, XLS, PPT. Tamanho máximo: 10MB por arquivo.
      </p>
    </div>
  );
};
