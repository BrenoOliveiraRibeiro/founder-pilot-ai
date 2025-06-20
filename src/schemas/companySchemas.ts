
import { z } from "zod";

// Schema para empresa
export const empresaSchema = z.object({
  id: z.string().uuid("ID da empresa deve ser um UUID válido"),
  nome: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.number().int().positive().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url("Website deve ser uma URL válida").optional(),
});

// Schema para perfil de usuário
export const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  avatar_url: z.string().url("URL do avatar deve ser válida").optional(),
});

// Tipos derivados dos schemas
export type Empresa = z.infer<typeof empresaSchema>;
export type Profile = z.infer<typeof profileSchema>;
