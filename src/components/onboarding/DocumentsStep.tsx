
import React from "react";
import { DocumentUpload } from "./DocumentUpload";

interface DocumentsStepProps {
  onDocumentChange: (file: File) => void;
  documents: Array<{ file: File, preview?: string }>;
  onRemoveDocument: (index: number) => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ 
  onDocumentChange,
  documents,
  onRemoveDocument
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Documentos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione documentos importantes como pitch deck, planilhas financeiras ou outros materiais
        </p>
      </div>
      <DocumentUpload 
        onDocumentChange={onDocumentChange}
        documents={documents}
        onRemoveDocument={onRemoveDocument}
      />
    </div>
  );
};
