
import React from "react";
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

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  bio: z.string().max(160).optional(),
  role: z.string().min(2, {
    message: "Cargo deve ter pelo menos 2 caracteres.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileSettingsTab() {
  const { toast } = useToast();
  const { user, profile, currentEmpresa } = useAuth();
  
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

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações de perfil e como elas aparecem na sua conta.
        </p>
      </div>
      
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarImage src="" alt={profile?.nome || user?.email?.split('@')[0] || "User"} />
          <AvatarFallback className="text-lg">{getInitials(profile?.nome || user?.email?.split('@')[0] || "User")}</AvatarFallback>
        </Avatar>
        <Button>Alterar foto</Button>
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
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Você pode escrever uma breve descrição sobre você mesmo.
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
