
-- Atualizar a tabela integracoes_bancarias para incluir novos campos necessários
ALTER TABLE integracoes_bancarias 
ADD COLUMN IF NOT EXISTS item_id TEXT,
ADD COLUMN IF NOT EXISTS account_data JSONB,
ADD COLUMN IF NOT EXISTS connection_token TEXT;

-- Criar índice para melhorar performance de busca por item_id
CREATE INDEX IF NOT EXISTS idx_integracoes_item_id ON integracoes_bancarias(item_id);

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN integracoes_bancarias.item_id IS 'ID do item retornado pelo Pluggy Connect';
COMMENT ON COLUMN integracoes_bancarias.account_data IS 'Dados das contas bancárias retornadas pelo Pluggy';
COMMENT ON COLUMN integracoes_bancarias.connection_token IS 'Token de conexão para reconexão automática';
