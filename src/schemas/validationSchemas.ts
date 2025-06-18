
import { z } from "zod";

export const financeDataSchema = z.object({
  saldoCaixa: z.number().finite(),
  entradasMesAtual: z.number().min(0, "Entradas devem ser positivas"),
  saidasMesAtual: z.number().min(0, "Saídas devem ser positivas"),
  fluxoCaixaMesAtual: z.number().finite(),
});

export type FinanceData = z.infer<typeof financeDataSchema>;

export const empresaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  num_funcionarios: z.number().min(1, "Número de funcionários deve ser positivo").optional(),
  data_fundacao: z.date().optional(),
});

export type EmpresaData = z.infer<typeof empresaSchema>;
