
import { z } from 'zod';

// Finance Data Schema
export const financeDataSchema = z.object({
  saldoCaixa: z.number().finite("Saldo deve ser um número válido"),
  entradasMesAtual: z.number().min(0, "Entradas devem ser positivas").finite("Entradas devem ser um número válido"),
  saidasMesAtual: z.number().min(0, "Saídas devem ser positivas").finite("Saídas devem ser um número válido"),
  fluxoCaixaMesAtual: z.number().finite("Fluxo de caixa deve ser um número válido"),
});

export type FinanceData = z.infer<typeof financeDataSchema>;

// Empresa Schema
export const empresaSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, "Nome da empresa é obrigatório"),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.number().int().positive().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
});

export type Empresa = z.infer<typeof empresaSchema>;

// Profile Schema
export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  cargo: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

// Runway Simulation Schema
export const runwaySimulationSchema = z.object({
  cashReserve: z.number().min(0, "Reserva de caixa deve ser positiva").finite("Reserva deve ser um número válido"),
  burnRate: z.number().min(0, "Burn rate deve ser positivo").finite("Burn rate deve ser um número válido"),
  revenueIncrease: z.number().min(0, "Aumento de receita deve ser positivo").finite("Aumento de receita deve ser um número válido"),
  costReduction: z.number().min(0, "Redução de custos deve ser positiva").finite("Redução de custos deve ser um número válido"),
  addFunding: z.number().min(0, "Funding adicional deve ser positivo").finite("Funding deve ser um número válido"),
});

export type RunwaySimulation = z.infer<typeof runwaySimulationSchema>;

// Pluggy Connection Schema
export const pluggyConnectionSchema = z.object({
  itemId: z.string().min(1, "Item ID é obrigatório"),
  accountData: z.any(),
  transactionsData: z.any().nullable(),
  isConnected: z.boolean(),
  connectionToken: z.string().optional(),
});

export type PluggyConnection = z.infer<typeof pluggyConnectionSchema>;
