
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useOnboardingUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Função para sanitizar nomes de arquivos
  const sanitizeFileName = (fileName: string): string => {
    // Remove caracteres especiais e substitui espaços por underscores
    const sanitized = fileName
      .replace(/[^\w\s.-]/g, '') // Remove todos os caracteres especiais exceto underscores, pontos e hífens
      .replace(/\s+/g, '_') // Substitui espaços por underscores
      .trim(); // Remove espaços no início e no fim
    
    // Adiciona timestamp para garantir unicidade
    const timestamp = Date.now();
    const fileExt = sanitized.includes('.') ? sanitized.split('.').pop() : '';
    const baseName = sanitized.includes('.') ? sanitized.split('.').slice(0, -1).join('.') : sanitized;
    
    return fileExt ? `${baseName}_${timestamp}.${fileExt}` : `${sanitized}_${timestamp}`;
  };

  const uploadLogo = async (
    file: File | null,
    userId: string,
    empresaId: string
  ): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Sanitiza o nome do arquivo
      const sanitizedFileName = sanitizeFileName(file.name);
      const logoFileName = `${userId}/${sanitizedFileName}`;
      
      const { data: logoData, error: logoError } = await supabase.storage
        .from('logos')
        .upload(logoFileName, file, {
          cacheControl: '3600',
          upsert: true // Changed to true to allow overwriting if needed
        });
        
      if (logoError) {
        console.error('Erro ao fazer upload do logo:', logoError);
        toast({
          title: "Erro no upload",
          description: `Não foi possível fazer o upload da imagem: ${logoError.message}`,
          variant: "destructive",
        });
        throw logoError;
      }
      
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
    } catch (error: any) {
      console.error('Erro ao fazer upload do logo:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
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
        // Sanitiza o nome do arquivo
        const sanitizedFileName = sanitizeFileName(doc.file.name);
        const docFileName = `${userId}/${sanitizedFileName}`;
        
        const { data: docData, error: docError } = await supabase.storage
          .from('documentos')
          .upload(docFileName, doc.file, {
            cacheControl: '3600',
            upsert: true // Changed to true to allow overwriting if needed
          });
          
        if (docError) {
          console.error('Erro ao fazer upload do documento:', docError);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer o upload do documento ${doc.file.name}: ${docError.message}`,
            variant: "destructive",
          });
          throw docError;
        }
        
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
          
        if (documentoError) {
          console.error('Erro ao salvar referência do documento:', documentoError);
          toast({
            title: "Erro ao salvar documento",
            description: documentoError.message || "Não foi possível salvar a referência do documento no banco de dados.",
            variant: "destructive",
          });
          throw documentoError;
        }
      }
      
      toast({
        title: "Upload concluído",
        description: `${documents.length} documento(s) carregado(s) com sucesso`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload dos documentos:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao processar os arquivos. Tente novamente.",
        variant: "destructive",
      });
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
