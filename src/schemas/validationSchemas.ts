
import { z } from 'zod';

export const financeDataSchema = z.object({
  saldoCaixa: z.number().finite("Saldo deve ser um número válido"),
  entradasMesAtual: z.number().min(0, "Entradas devem ser positivas").finite("Entradas devem ser um número válido"),
  saidasMesAtual: z.number().min(0, "Saídas devem ser positivas").finite("Saídas devem ser um número válido"),
  fluxoCaixaMesAtual: z.number().finite("Fluxo de caixa deve ser um número válido"),
});

export type FinanceData = z.infer<typeof financeDataSchema>;
