
# Pluggy Transactions Import

Esta Edge Function realiza a importação completa de transações da API da Pluggy para o Supabase.

## Funcionalidades

1. **Autenticação na API da Pluggy** - Usa as credenciais armazenadas nos secrets
2. **Busca paginada de transações** - Obtém todas as transações do item conectado
3. **Conversão de dados** - Transforma dados da Pluggy para o formato da tabela `transacoes`
4. **Importação inteligente** - Evita duplicatas baseado no ID da Pluggy
5. **Log detalhado** - Registra estatísticas da operação

## Parâmetros de entrada

```json
{
  "empresa_id": "uuid da empresa",
  "item_id": "ID do item da Pluggy"
}
```

## Resposta

```json
{
  "success": true,
  "log": {
    "total_processed": 150,
    "total_inserted": 120,
    "total_ignored": 30,
    "errors": [],
    "started_at": "2023-...",
    "completed_at": "2023-..."
  },
  "message": "Importação concluída..."
}
```

## Secrets necessários

- `PLUGGY_CLIENT_ID` - Client ID da Pluggy
- `PLUGGY_CLIENT_SECRET` - Client Secret da Pluggy

## Mapeamento de dados

| Pluggy | Supabase |
|--------|----------|
| description | descricao |
| amount | valor |
| date | data_transacao |
| category | categoria |
| amount >= 0 | tipo (receita/despesa) |
| - | metodo_pagamento ("Importado da Pluggy") |

Os dados originais da Pluggy são preservados no campo `detalhes_pluggy` para referência.
