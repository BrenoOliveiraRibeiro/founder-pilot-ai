
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { EmpresaInfoForm, empresaFormSchema } from "@/components/onboarding/EmpresaInfoForm";
import { LogoStep } from "@/components/onboarding/LogoStep";
import { DocumentsStep } from "@/components/onboarding/DocumentsStep";
import { OnboardingFooter } from "@/components/onboarding/OnboardingFooter";
import { z } from "zod";

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [documents, setDocuments] = useState<Array<{ file: File, preview?: string }>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleLogoChange = useCallback((file: File | null, previewUrl: string) => {
    setLogoFile(file);
    setLogoPreview(previewUrl);
  }, []);

  const handleDocumentChange = useCallback((file: File) => {
    setDocuments(prev => [...prev, { file }]);
  }, []);

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const goToNextStep = () => {
    if (step === 1) {
      form.trigger().then(isValid => {
        if (isValid) setStep(prev => Math.min(prev + 1, 3));
      });
    } else {
      setStep(prev => Math.min(prev + 1, 3));
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
      let logoUrl = null;
      if (logoFile && empresa) {
        const logoFileName = `${user.id}/${Date.now()}_${logoFile.name}`;
        const { data: logoData, error: logoError } = await supabase.storage
          .from('logos')
          .upload(logoFileName, logoFile);
          
        if (logoError) throw logoError;
        
        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(logoFileName);
          
        logoUrl = publicUrlData.publicUrl;
        
        // Atualizar empresa com logo URL
        await supabase
          .from('empresas')
          .update({ logo_url: logoUrl })
          .eq('id', empresa.id);
      }
      
      // 3. Fazer upload dos documentos
      for (const doc of documents) {
        if (!empresa) continue;
        
        const docFileName = `${user.id}/${Date.now()}_${doc.file.name}`;
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
            empresa_id: empresa.id,
            nome: doc.file.name,
            tipo: doc.file.type,
            tamanho: doc.file.size,
            arquivo_url: publicDocUrlData.publicUrl
          });
          
        if (documentoError) throw documentoError;
      }
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Agora vamos conectar seus dados financeiros.",
      });
      
      // Usar setTimeout para garantir que o toast seja exibido antes do redirecionamento
      setTimeout(() => {
        navigate("/connect", { replace: true });
      }, 100);
      
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

  const totalSteps = 3;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <EmpresaInfoForm form={form} />;
      case 2:
        return <LogoStep onLogoChange={handleLogoChange} existingLogo={logoPreview} />;
      case 3:
        return (
          <DocumentsStep
            onDocumentChange={handleDocumentChange}
            documents={documents}
            onRemoveDocument={handleRemoveDocument}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-xl">FP</span>
            </div>
            <CardTitle className="text-2xl font-bold">FounderPilot AI</CardTitle>
          </div>
          <CardTitle className="text-xl text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            Fale um pouco sobre sua empresa para começarmos
          </CardDescription>
          
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}
              <OnboardingFooter 
                step={step}
                totalSteps={totalSteps}
                goToPrevStep={goToPrevStep}
                goToNextStep={goToNextStep}
                onSubmit={() => form.handleSubmit(handleSubmit)()}
                isLoading={isLoading}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Dialog para confirmação ou erros */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploads em andamento</DialogTitle>
          </DialogHeader>
          <div>
            <p>Estamos processando seus arquivos...</p>
            <Progress value={75} className="my-4" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
