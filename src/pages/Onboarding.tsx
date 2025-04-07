
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, ArrowLeft, Briefcase, Building, Calendar, Users, Upload, File, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Schema para cada etapa do formulário
const empresaFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.coerce.number().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
});

// Componente para exibir o progresso entre etapas
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-6">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Dados Básicos</span>
        <span>Logo</span>
        <span>Documentos</span>
      </div>
    </div>
  );
};

// Componente para upload de logo
const LogoUpload = ({ onLogoChange, existingLogo }: { onLogoChange: (file: File | null, previewUrl: string) => void; existingLogo?: string }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(existingLogo || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem.');
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
              accept="image/*"
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
        Formatos aceitos: PNG, JPG ou SVG. Tamanho máximo: 2MB.
      </p>
    </div>
  );
};

// Componente para upload de documentos
const DocumentUpload = ({ 
  onDocumentChange, 
  documents,
  onRemoveDocument 
}: { 
  onDocumentChange: (file: File) => void; 
  documents: Array<{ file: File, preview?: string }>;
  onRemoveDocument: (index: number) => void;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Adicionar cada arquivo selecionado
    Array.from(files).forEach(file => {
      onDocumentChange(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col p-4 border-2 border-dashed rounded-md">
        <div className="flex flex-col items-center justify-center py-6">
          <File className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Arraste e solte ou clique para adicionar pitch deck, planilhas ou documentos
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
          className="w-full"
        >
          Selecionar arquivos
        </Button>
      </div>
      
      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Arquivos selecionados</h4>
          <div className="max-h-60 overflow-y-auto">
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
                  className="text-red-500 h-8 w-8 p-0"
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

  const form = useForm<z.infer<typeof empresaFormSchema>>({
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
      const isValid = form.trigger();
      if (!isValid) return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: z.infer<typeof empresaFormSchema>) => {
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
      const documentUploadPromises = documents.map(async doc => {
        if (!empresa) return null;
        
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
        const { data: documentoData, error: documentoError } = await supabase
          .from('documentos')
          .insert({
            empresa_id: empresa.id,
            nome: doc.file.name,
            tipo: doc.file.type,
            tamanho: doc.file.size,
            arquivo_url: publicDocUrlData.publicUrl
          });
          
        if (documentoError) throw documentoError;
        
        return documentoData;
      });
      
      await Promise.all(documentUploadPromises);
      
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
        return (
          <>
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da empresa</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <Building className="h-5 w-5 text-muted-foreground mr-2" />
                      <Input className="border-0 p-0 shadow-none focus-visible:ring-0" placeholder="Nome da sua startup" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="segmento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segmento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Marketplace">Marketplace</SelectItem>
                        <SelectItem value="Fintech">Fintech</SelectItem>
                        <SelectItem value="Healthtech">Healthtech</SelectItem>
                        <SelectItem value="Edtech">Edtech</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estagio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estágio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ideação">Ideação</SelectItem>
                        <SelectItem value="MVP">MVP</SelectItem>
                        <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series B+">Series B+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_funcionarios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de funcionários</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md px-3 py-2">
                        <Users className="h-5 w-5 text-muted-foreground mr-2" />
                        <Input 
                          className="border-0 p-0 shadow-none focus-visible:ring-0" 
                          type="number" 
                          placeholder="Quantos funcionários?" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_fundacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de fundação</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md px-3 py-2">
                        <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                        <Input className="border-0 p-0 shadow-none focus-visible:ring-0" type="date" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground mr-2" />
                      <Input className="border-0 p-0 shadow-none focus-visible:ring-0" placeholder="https://exemplo.com" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Logo da empresa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione a logo da sua empresa para personalizar sua experiência
              </p>
            </div>
            <LogoUpload onLogoChange={handleLogoChange} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Documentos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione documentos importantes como pitch deck, planilhas financeiras ou outros materiais
              </p>
            </div>
            <DocumentUpload 
              onDocumentChange={handleDocumentChange} 
              documents={documents}
              onRemoveDocument={handleRemoveDocument}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={goToPrevStep} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        ) : (
          <div></div> // Espaço vazio para manter o layout
        )}
        
        {step < totalSteps ? (
          <Button type="button" onClick={goToNextStep} disabled={isLoading}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} className="group" disabled={isLoading}>
            <span className="flex items-center">
              {isLoading ? "Salvando..." : "Finalizar"} 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        )}
      </div>
    );
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
            <form className="space-y-4">
              {renderStepContent()}
              {renderFooter()}
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
