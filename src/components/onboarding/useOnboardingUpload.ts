
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fromEmpresas } from "@/integrations/supabase/typedClient";

export const useOnboardingUpload = () => {
  const { toast } = useToast();

  // Função para verificar e criar um bucket se não existir
  const ensureBucketExists = async (bucketName: string) => {
    try {
      // Verifica se o bucket existe
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error(`Erro ao listar buckets:`, error);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} não existe, tentando criar...`);
        
        // Tenta criar o bucket
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error(`Erro ao criar bucket ${bucketName}:`, createError);
          return false;
        }
        
        console.log(`Bucket ${bucketName} criado com sucesso.`);
      } else {
        console.log(`Bucket ${bucketName} já existe.`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error);
      return false;
    }
  };

  const uploadLogo = async (file: File, userId: string, empresaId: string) => {
    try {
      const bucketName = 'empresa_logos';
      const bucketExists = await ensureBucketExists(bucketName);
      
      if (!bucketExists) {
        throw new Error("Não foi possível acessar ou criar o armazenamento para logos.");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${empresaId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      // Atualiza o logo_url na empresa
      const { error: updateError } = await fromEmpresas()
        .update({ logo_url: data.publicUrl })
        .eq('id', empresaId);

      if (updateError) throw updateError;

      console.log("Logo atualizado com sucesso:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      toast({
        title: "Erro no upload do logo",
        description: "Não foi possível fazer upload do logo, mas os dados da empresa foram salvos.",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadDocuments = async (
    documents: Array<{ file: File; preview?: string }>,
    userId: string,
    empresaId: string
  ) => {
    try {
      const bucketName = 'empresa_documentos';
      const bucketExists = await ensureBucketExists(bucketName);
      
      if (!bucketExists) {
        throw new Error("Não foi possível acessar ou criar o armazenamento para documentos.");
      }
      
      const uploadPromises = documents.map(async (doc) => {
        const fileExt = doc.file.name.split('.').pop();
        const fileName = `${empresaId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, doc.file);

        if (error) throw error;

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return data.publicUrl;
      });

      const results = await Promise.allSettled(uploadPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      if (successCount > 0) {
        toast({
          title: "Documentos enviados",
          description: `${successCount} de ${documents.length} documentos foram enviados com sucesso.`,
        });
      }
      
      return results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);
    } catch (error) {
      console.error("Erro ao fazer upload dos documentos:", error);
      toast({
        title: "Erro no upload de documentos",
        description: "Alguns documentos não puderam ser enviados, mas os dados da empresa foram salvos.",
        variant: "destructive",
      });
      return [];
    }
  };

  return { uploadLogo, uploadDocuments };
};
