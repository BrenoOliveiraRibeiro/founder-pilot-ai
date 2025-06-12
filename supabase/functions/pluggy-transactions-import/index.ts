
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  currencyCode: string;
  date: string;
  accountId: string;
  category?: string;
  type?: string;
  merchant?: {
    name?: string;
  };
}

interface ImportLog {
  total_processed: number;
  total_inserted: number;
  total_ignored: number;
  errors: string[];
  started_at: string;
  completed_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { empresa_id, item_id } = await req.json();
    
    if (!empresa_id || !item_id) {
      throw new Error('empresa_id e item_id são obrigatórios');
    }

    console.log(`Iniciando importação de transações para empresa ${empresa_id}, item ${item_id}`);
    
    const startTime = new Date().toISOString();
    const log: ImportLog = {
      total_processed: 0,
      total_inserted: 0,
      total_ignored: 0,
      errors: [],
      started_at: startTime,
      completed_at: ''
    };

    // 1. Autenticar na API da Pluggy
    const pluggyAuth = await authenticatePluggy();
    console.log('Autenticação na Pluggy realizada com sucesso');

    // 2. Buscar transações da Pluggy com paginação
    const allTransactions = await fetchAllTransactions(pluggyAuth, item_id);
    console.log(`Total de ${allTransactions.length} transações encontradas`);
    
    log.total_processed = allTransactions.length;

    // 3. Conectar ao Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Processar e inserir transações no Supabase
    const results = await processAndInsertTransactions(supabase, allTransactions, empresa_id, log);
    
    log.completed_at = new Date().toISOString();
    
    console.log('Importação concluída:', log);

    return new Response(
      JSON.stringify({
        success: true,
        log,
        message: `Importação concluída. ${log.total_inserted} transações inseridas de ${log.total_processed} processadas.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na importação:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Falha na importação de transações'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Autentica na API da Pluggy usando as credenciais armazenadas nos secrets
 */
async function authenticatePluggy(): Promise<string> {
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Credenciais da Pluggy não configuradas nos secrets');
  }

  const response = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      clientId,
      clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`Falha na autenticação Pluggy: ${response.status}`);
  }

  const data = await response.json();
  return data.apiKey;
}

/**
 * Busca todas as transações da Pluggy com suporte a paginação
 */
async function fetchAllTransactions(apiKey: string, itemId: string): Promise<PluggyTransaction[]> {
  const allTransactions: PluggyTransaction[] = [];
  let page = 1;
  const pageSize = 500; // Máximo permitido pela API
  let hasMore = true;

  while (hasMore) {
    console.log(`Buscando página ${page} de transações...`);
    
    const url = `https://api.pluggy.ai/transactions?itemId=${itemId}&page=${page}&pageSize=${pageSize}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar transações (página ${page}): ${response.status}`);
    }

    const data = await response.json();
    const transactions = data.results || [];
    
    allTransactions.push(...transactions);
    
    // Verificar se há mais páginas
    hasMore = transactions.length === pageSize && data.totalPages > page;
    page++;
    
    console.log(`Página ${page - 1}: ${transactions.length} transações obtidas`);
  }

  return allTransactions;
}

/**
 * Processa e insere transações no Supabase
 */
async function processAndInsertTransactions(
  supabase: any, 
  transactions: PluggyTransaction[], 
  empresaId: string,
  log: ImportLog
): Promise<void> {
  
  for (const transaction of transactions) {
    try {
      // Converter dados da Pluggy para o formato da tabela transacoes
      const transacaoData = {
        empresa_id: empresaId,
        descricao: transaction.description || transaction.merchant?.name || 'Transação importada',
        valor: transaction.amount,
        data_transacao: transaction.date.split('T')[0], // Extrair apenas a data
        categoria: transaction.category || 'Outros',
        tipo: transaction.amount >= 0 ? 'receita' : 'despesa',
        metodo_pagamento: 'Importado da Pluggy',
        // Armazenar dados originais da Pluggy para referência
        detalhes_pluggy: {
          pluggy_id: transaction.id,
          account_id: transaction.accountId,
          currency_code: transaction.currencyCode,
          original_data: transaction
        }
      };

      // Verificar se a transação já existe (baseado no ID da Pluggy)
      const { data: existing } = await supabase
        .from('transacoes')
        .select('id')
        .eq('empresa_id', empresaId)
        .contains('detalhes_pluggy', { pluggy_id: transaction.id })
        .single();

      if (existing) {
        log.total_ignored++;
        console.log(`Transação ${transaction.id} já existe, ignorando...`);
        continue;
      }

      // Inserir nova transação
      const { error } = await supabase
        .from('transacoes')
        .insert(transacaoData);

      if (error) {
        log.errors.push(`Erro ao inserir transação ${transaction.id}: ${error.message}`);
        console.error(`Erro ao inserir transação ${transaction.id}:`, error);
      } else {
        log.total_inserted++;
        console.log(`Transação ${transaction.id} inserida com sucesso`);
      }

    } catch (error) {
      log.errors.push(`Erro ao processar transação ${transaction.id}: ${error.message}`);
      console.error(`Erro ao processar transação ${transaction.id}:`, error);
    }
  }
}
