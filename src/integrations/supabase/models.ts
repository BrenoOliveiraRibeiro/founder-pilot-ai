
// Definição dos tipos para as tabelas do Supabase
export type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  cargo: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Empresa = {
  id: string;
  user_id: string;
  nome: string;
  segmento: string | null;
  estagio: string | null;
  num_funcionarios: number | null;
  data_fundacao: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Transacao = {
  id: string;
  empresa_id: string;
  descricao: string;
  valor: number;
  data_transacao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  metodo_pagamento: string | null;
  recorrente: boolean;
  created_at: string;
}

export type Metrica = {
  id: string;
  empresa_id: string;
  data_referencia: string;
  caixa_atual: number | null;
  receita_mensal: number | null;
  burn_rate: number | null;
  runway_meses: number | null;
  mrr_growth: number | null;
  cash_flow: number | null;
  created_at: string;
  updated_at: string;
}

export type IntegracaoBancaria = {
  id: string;
  empresa_id: string;
  nome_banco: string;
  tipo_conexao: string;
  status: string;
  ultimo_sincronismo: string | null;
  detalhes: any | null;
  account_data: any | null;
  item_id: string | null;
  connection_token: string | null;
  created_at: string;
  updated_at: string;
}

export type Insight = {
  id: string;
  empresa_id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'visto' | 'implementado' | 'ignorado';
  data_criacao: string;
  data_resolucao: string | null;
}

export type Documento = {
  id: string;
  empresa_id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  arquivo_url: string;
  created_at: string;
  updated_at: string | null;
}
