
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingUpload } from "./useOnboardingUpload";
import { empresaFormSchema } from "./EmpresaInfoForm";
import { empresaSchema, type Empresa } from "@/schemas/validationSchemas";
import { z } from "zod";

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

export const useOnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [documents, setDocuments] = useState<Array<{ file: File, preview?: string }>>([]);

  const { user, refreshEmpresas, refreshProfile } = useAuth();
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
    
    if (!user?.id) {
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
      console.log("Criando empresa para usuário:", user.id);
      
      // Preparar dados da empresa para validação
      const empresaData = {
        id: crypto.randomUUID(), // Gerar UUID temporário para validação
        nome: values.nome,
        segmento: values.segmento || undefined,
        estagio: values.estagio || undefined,
        num_funcionarios: values.num_funcionarios || undefined,
        data_fundacao: values.data_fundacao || undefined,
        website: values.website || undefined,
      };

      // Validar dados da empresa antes de enviar
      const validatedEmpresa = empresaSchema.omit({ id: true }).parse(empresaData);
      
      // 1. Criar empresa vinculada ao usuário
      const { data: empresa, error } = await supabase
        .from('empresas')
        .insert([
          {
            user_id: user.id,
            nome: validatedEmpresa.nome,
            segmento: validatedEmpresa.segmento || null,
            estagio: validatedEmpresa.estagio || null,
            num_funcionarios: validatedEmpresa.num_funcionarios || null,
            data_fundacao: validatedEmpresa.data_fundacao || null,
            website: validatedEmpresa.website || null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar empresa:", error);
        throw error;
      }
      
      console.log("Empresa criada com sucesso:", empresa);
      
      // 2. Fazer upload do logo se existir
      if (logoFile && empresa) {
        try {
          await uploadLogo(logoFile, user.id, empresa.id);
          console.log("Logo enviado com sucesso");
        } catch (logoError) {
          console.error("Erro ao enviar logo:", logoError);
          // Não falhar o processo todo por erro de upload
        }
      }
      
      // 3. Fazer upload dos documentos
      if (documents.length > 0) {
        try {
          await uploadDocuments(documents, user.id, empresa.id);
          console.log("Documentos enviados com sucesso");
        } catch (docsError) {
          console.error("Erro ao enviar documentos:", docsError);
          // Não falhar o processo todo por erro de upload
        }
      }
      
      // 4. Atualizar o perfil do usuário se necessário
      await refreshProfile();
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: `${empresa.nome} foi vinculada ao seu perfil.`,
      });

      // 5. Atualizar lista de empresas e definir como empresa atual
      await refreshEmpresas();
      
      // 6. Navegar diretamente para o dashboard se a empresa foi criada com sucesso
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      
      // Se for erro de validação Zod, mostrar erro mais específico
      if (error.name === 'ZodError') {
        toast({
          title: "Dados da empresa inválidos",
          description: `Erro de validação: ${error.errors.map((e: any) => e.message).join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar empresa",
          description: error.message || "Não foi possível cadastrar a empresa. Tente novamente.",
          variant: "destructive",
        });
      }
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
