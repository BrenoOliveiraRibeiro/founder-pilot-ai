
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingUpload } from "./useOnboardingUpload";
import { z } from "zod";
import { empresaFormSchema } from "./EmpresaInfoForm";

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

export const useOnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [documents, setDocuments] = useState<Array<{ file: File, preview?: string }>>([]);

  const { user, refreshEmpresas } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadLogo, uploadDocuments } = useOnboardingUpload();
  
  const totalSteps = 3;

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nome: "",
      segmento: "",
      estagio: "",
      num_funcionarios: undefined,
      data_fundacao: "",
      website: "",
    },
  });

  const handleLogoChange = (file: File | null, previewUrl: string) => {
    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  const handleDocumentChange = (file: File) => {
    setDocuments(prev => [...prev, { file }]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const goToNextStep = () => {
    if (step === 1) {
      form.trigger().then(isValid => {
        if (isValid) setStep(prev => Math.min(prev + 1, totalSteps));
      });
    } else {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const goToPrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const values = form.getValues();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para continuar.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Criar empresa
      const { data: empresa, error } = await supabase
        .from('empresas')
        .insert([
          {
            user_id: user.id,
            nome: values.nome,
            segmento: values.segmento || null,
            estagio: values.estagio || null,
            num_funcionarios: values.num_funcionarios || null,
            data_fundacao: values.data_fundacao || null,
            website: values.website || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // 2. Fazer upload do logo se existir
      if (logoFile && empresa) {
        await uploadLogo(logoFile, user.id, empresa.id);
      }
      
      // 3. Fazer upload dos documentos
      if (documents.length > 0) {
        await uploadDocuments(documents, user.id, empresa.id);
      }
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Agora vamos conectar seus dados financeiros.",
      });

      // Force reload the auth context to get updated empresas list
      await refreshEmpresas();
      navigate("/connect");
      
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar a empresa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    step,
    totalSteps,
    isLoading,
    logoPreview,
    documents,
    handleLogoChange,
    handleDocumentChange,
    handleRemoveDocument,
    goToNextStep,
    goToPrevStep,
    handleSubmit
  };
};
