
import { z } from "zod";

// Schema para dados financeiros básicos
export const financeDataSchema = z.object({
  saldoCaixa: z.number(), // Removido .min(0) para permitir saldo negativo
  entradasMesAtual: z.number().min(0, "Entradas devem ser positivas"),
  saidasMesAtual: z.number().min(0, "Saídas devem ser positivas"),
  fluxoCaixaMesAtual: z.number(),
});

// Schema para simulação de runway - agora com campos obrigatórios
export const runwaySimulationSchema = z.object({
  cashReserve: z.number().min(0, "Reserva de caixa deve ser positiva"),
  burnRate: z.number().min(0, "Burn rate deve ser positivo"),
  revenueIncrease: z.number().min(0).max(100, "Aumento de receita deve estar entre 0% e 100%"),
  costReduction: z.number().min(0).max(100, "Redução de custos deve estar entre 0% e 100%"),
  addFunding: z.number().min(0, "Captação adicional deve ser positiva"),
});

// Tipos derivados dos schemas
export type FinanceData = z.infer<typeof financeDataSchema>;
export type RunwaySimulation = z.infer<typeof runwaySimulationSchema>;
