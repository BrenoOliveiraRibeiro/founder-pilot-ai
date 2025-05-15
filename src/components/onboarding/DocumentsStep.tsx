
import React from "react";
import { DocumentUpload } from "./DocumentUpload";

interface DocumentsStepProps {
  onDocumentChange: (file: File) => void;
  documents: Array<{ file: File, preview?: string }>;
  onRemoveDocument: (index: number) => void;
  isMobile?: boolean;
  isSafariIOS?: boolean;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ 
  onDocumentChange,
  documents,
  onRemoveDocument,
  isMobile,
  isSafariIOS
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`${isMobile ? 'text-lg' : 'text-lg'} font-medium mb-2`}>Documentos</h3>
        <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-muted-foreground mb-4`}>
          Adicione documentos importantes como pitch deck, planilhas financeiras ou outros materiais
        </p>
      </div>
      <DocumentUpload 
        onDocumentChange={onDocumentChange}
        documents={documents}
        onRemoveDocument={onRemoveDocument}
        isMobile={isMobile}
        isSafariIOS={isSafariIOS}
      />
    </div>
  );
};
