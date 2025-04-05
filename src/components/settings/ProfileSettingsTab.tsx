
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  bio: z.string().max(500).optional(), // Aumentado de 160 para 500 caracteres
  role: z.string().min(2, {
    message: "Cargo deve ter pelo menos 2 caracteres.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileSettingsTab() {
  const { toast } = useToast();
  const { user, profile, currentEmpresa } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    name: profile?.nome || "",
    email: user?.email || "",
    bio: profile?.bio || "",
    role: profile?.cargo || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  // Load avatar if profile has one
  React.useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (!user?.id) {
        throw new Error("Usuário não encontrado");
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          nome: data.name,
          bio: data.bio,
          cargo: data.role,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsUploading(true);

      // Gera um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo para o bucket do Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obtém a URL pública do arquivo
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const avatar_url = data.publicUrl;

      // Atualiza o perfil do usuário com a URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatar_url);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro ao atualizar foto",
        description: "Não foi possível atualizar sua foto de perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações de perfil e como elas aparecem na sua conta.
        </p>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="relative group">
          <Avatar 
            className="h-20 w-20 cursor-pointer group-hover:opacity-80 transition-opacity" 
            onClick={handleAvatarClick}
          >
            <AvatarImage src={avatarUrl || ""} alt={profile?.nome || user?.email?.split('@')[0] || "User"} />
            <AvatarFallback className="text-lg">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                getInitials(profile?.nome || user?.email?.split('@')[0] || "User")
              )}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*"
            disabled={isUploading}
          />
        </div>
        <Button onClick={handleAvatarClick} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : "Alterar foto"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormDescription>
                  Este é o seu nome completo que aparecerá em seu perfil.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} readOnly />
                </FormControl>
                <FormDescription>
                  Este é o email vinculado à sua conta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu cargo" {...field} />
                </FormControl>
                <FormDescription>
                  Seu cargo na empresa {currentEmpresa?.nome}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escreva uma breve biografia..."
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Você pode escrever uma descrição sobre você mesmo (máximo de 500 caracteres).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Salvar alterações</Button>
        </form>
      </Form>
    </div>
  );
}
