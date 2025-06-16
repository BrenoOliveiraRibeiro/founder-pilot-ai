
-- Adicionar campo transaction_hash na tabela transacoes (se não existir)
ALTER TABLE public.transacoes 
ADD COLUMN IF NOT EXISTS transaction_hash text;

-- Criar função para gerar hash de transação
CREATE OR REPLACE FUNCTION generate_transaction_hash(
  p_descricao text,
  p_valor numeric,
  p_data_transacao date,
  p_empresa_id uuid
) RETURNS text AS $$
BEGIN
  RETURN md5(CONCAT(p_descricao, '|', p_valor::text, '|', p_data_transacao::text, '|', p_empresa_id::text));
END;
$$ LANGUAGE plpgsql;

-- Atualizar transações existentes com hash
UPDATE public.transacoes 
SET transaction_hash = generate_transaction_hash(descricao, valor, data_transacao, empresa_id)
WHERE transaction_hash IS NULL;

-- Remover transações duplicadas ANTES de criar a constraint
-- Manter apenas a transação mais recente de cada grupo de duplicatas
DELETE FROM public.transacoes 
WHERE id NOT IN (
  SELECT DISTINCT ON (transaction_hash) id
  FROM public.transacoes
  ORDER BY transaction_hash, created_at DESC
);

-- Agora criar a constraint de unicidade (sem duplicatas)
ALTER TABLE public.transacoes 
ADD CONSTRAINT unique_transaction_hash UNIQUE (transaction_hash);

-- Criar trigger para auto-gerar hash em novas transações
CREATE OR REPLACE FUNCTION set_transaction_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transaction_hash = generate_transaction_hash(
    NEW.descricao, 
    NEW.valor, 
    NEW.data_transacao, 
    NEW.empresa_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transaction_hash ON public.transacoes;
CREATE TRIGGER trigger_set_transaction_hash
  BEFORE INSERT ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_hash();
