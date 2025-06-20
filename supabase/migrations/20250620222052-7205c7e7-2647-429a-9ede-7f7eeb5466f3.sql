
-- Adicionar coluna para salvar dados de saldo na tabela transacoes
ALTER TABLE public.transacoes 
ADD COLUMN saldo_conta jsonb;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.transacoes.saldo_conta IS 'Dados de saldo da conta no momento da transação (JSON contendo balance, currencyCode, etc.)';
