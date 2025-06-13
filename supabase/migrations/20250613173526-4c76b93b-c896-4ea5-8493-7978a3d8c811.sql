
-- Criar tabela para armazenar transações bancárias detalhadas
CREATE TABLE public.transacoes_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  integracao_id UUID NOT NULL,
  account_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_transacao DATE NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  metodo_pagamento TEXT,
  codigo_moeda TEXT DEFAULT 'BRL',
  balance_after DECIMAL(15,2),
  merchant_name TEXT,
  merchant_category TEXT,
  location TEXT,
  reference TEXT,
  status TEXT DEFAULT 'processed',
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_transaction_per_account UNIQUE (account_id, transaction_id),
  
  -- Foreign keys
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (integracao_id) REFERENCES public.integracoes_bancarias(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX idx_transacoes_bancarias_empresa_id ON public.transacoes_bancarias(empresa_id);
CREATE INDEX idx_transacoes_bancarias_integracao_id ON public.transacoes_bancarias(integracao_id);
CREATE INDEX idx_transacoes_bancarias_account_id ON public.transacoes_bancarias(account_id);
CREATE INDEX idx_transacoes_bancarias_data_transacao ON public.transacoes_bancarias(data_transacao);
CREATE INDEX idx_transacoes_bancarias_tipo ON public.transacoes_bancarias(tipo);
CREATE INDEX idx_transacoes_bancarias_categoria ON public.transacoes_bancarias(categoria);

-- Habilitar Row Level Security
ALTER TABLE public.transacoes_bancarias ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (usuários podem ver apenas transações de suas empresas)
CREATE POLICY "Users can view their company transactions" 
  ON public.transacoes_bancarias 
  FOR SELECT 
  USING (
    empresa_id IN (
      SELECT id FROM public.empresas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their company transactions" 
  ON public.transacoes_bancarias 
  FOR INSERT 
  WITH CHECK (
    empresa_id IN (
      SELECT id FROM public.empresas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company transactions" 
  ON public.transacoes_bancarias 
  FOR UPDATE 
  USING (
    empresa_id IN (
      SELECT id FROM public.empresas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company transactions" 
  ON public.transacoes_bancarias 
  FOR DELETE 
  USING (
    empresa_id IN (
      SELECT id FROM public.empresas WHERE user_id = auth.uid()
    )
  );

-- Adicionar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transacoes_bancarias_updated_at
    BEFORE UPDATE ON public.transacoes_bancarias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.transacoes_bancarias IS 'Armazena transações bancárias importadas via Open Finance';
COMMENT ON COLUMN public.transacoes_bancarias.transaction_id IS 'ID único da transação fornecido pelo banco/Pluggy';
COMMENT ON COLUMN public.transacoes_bancarias.account_id IS 'ID da conta bancária associada';
COMMENT ON COLUMN public.transacoes_bancarias.balance_after IS 'Saldo da conta após a transação';
COMMENT ON COLUMN public.transacoes_bancarias.metadata IS 'Dados adicionais em formato JSON fornecidos pela API';
