
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLogo = async (
    file: File | null,
    userId: string,
    empresaId: string
  ): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      const logoFileName = `${userId}/${Date.now()}_${file.name}`;
      
      const { data: logoData, error: logoError } = await supabase.storage
        .from('logos')
        .upload(logoFileName, file);
        
      if (logoError) throw logoError;
      
      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(logoFileName);
        
      const logoUrl = publicUrlData.publicUrl;
      
      // Atualizar empresa com logo URL
      await supabase
        .from('empresas')
        .update({ logo_url: logoUrl })
        .eq('id', empresaId);
        
      return logoUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadDocuments = async (
    documents: Array<{ file: File, preview?: string }>,
    userId: string,
    empresaId: string
  ) => {
    try {
      setIsUploading(true);
      
      for (const doc of documents) {
        const docFileName = `${userId}/${Date.now()}_${doc.file.name}`;
        const { data: docData, error: docError } = await supabase.storage
          .from('documentos')
          .upload(docFileName, doc.file);
          
        if (docError) throw docError;
        
        // Obter URL pública
        const { data: publicDocUrlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(docFileName);
          
        // Salvar referência do documento no banco
        const { error: documentoError } = await supabase
          .from('documentos')
          .insert({
            empresa_id: empresaId,
            nome: doc.file.name,
            tipo: doc.file.type,
            tamanho: doc.file.size,
            arquivo_url: publicDocUrlData.publicUrl
          });
          
        if (documentoError) throw documentoError;
      }
    } catch (error) {
      console.error('Erro ao fazer upload dos documentos:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadLogo,
    uploadDocuments
  };
};
