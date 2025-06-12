
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
  console.log(`Request method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Erro ao parsear JSON da requisição:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato JSON inválido na requisição',
          details: parseError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { empresa_id, item_id } = requestBody;
    console.log('Parâmetros recebidos:', { empresa_id, item_id });
    
    if (!empresa_id || !item_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'empresa_id e item_id são obrigatórios',
          received: { empresa_id, item_id }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
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
    let pluggyAuth;
    try {
      pluggyAuth = await authenticatePluggy();
      console.log('Autenticação na Pluggy realizada com sucesso');
    } catch (authError) {
      console.error('Erro na autenticação Pluggy:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha na autenticação Pluggy: ${authError.message}`,
          details: authError
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // 2. Buscar transações da Pluggy com paginação
    let allTransactions;
    try {
      allTransactions = await fetchAllTransactions(pluggyAuth, item_id);
      console.log(`Total de ${allTransactions.length} transações encontradas`);
    } catch (fetchError) {
      console.error('Erro ao buscar transações:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha ao buscar transações: ${fetchError.message}`,
          details: fetchError
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    log.total_processed = allTransactions.length;

    // 3. Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Credenciais do Supabase não encontradas');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciais do Supabase não configuradas',
          details: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Processar e inserir transações no Supabase
    try {
      await processAndInsertTransactions(supabase, allTransactions, empresa_id, log);
    } catch (insertError) {
      console.error('Erro ao inserir transações:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha ao inserir transações: ${insertError.message}`,
          details: insertError,
          partial_log: log
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
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
    console.error('Erro geral na importação:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        stack: error.stack,
        details: error
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
  
  console.log('Credenciais Pluggy:', { 
    clientId: clientId ? 'PRESENTE' : 'AUSENTE', 
    clientSecret: clientSecret ? 'PRESENTE' : 'AUSENTE' 
  });
  
  if (!clientId || !clientSecret) {
    throw new Error('Credenciais da Pluggy não configuradas nos secrets (PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET)');
  }

  console.log('Fazendo requisição de autenticação para Pluggy...');
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

  console.log(`Resposta da autenticação Pluggy: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resposta de erro da Pluggy:', errorText);
    throw new Error(`Falha na autenticação Pluggy: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Token recebido da Pluggy');
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
    console.log(`URL da requisição: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log(`Resposta da página ${page}: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na página ${page}:`, errorText);
      throw new Error(`Erro ao buscar transações (página ${page}): ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const transactions = data.results || [];
    
    console.log(`Página ${page}: ${transactions.length} transações obtidas`);
    allTransactions.push(...transactions);
    
    // Verificar se há mais páginas
    hasMore = transactions.length === pageSize && data.totalPages > page;
    page++;
    
    console.log(`Hasmore: ${hasMore}, Total pages: ${data.totalPages}, Current page: ${page - 1}`);
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
  
  console.log(`Processando ${transactions.length} transações para empresa ${empresaId}`);
  
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
        // Adicionar campo JSON para dados da Pluggy (se existir na tabela)
        detalhes_pluggy: {
          pluggy_id: transaction.id,
          account_id: transaction.accountId,
          currency_code: transaction.currencyCode,
          original_data: transaction
        }
      };

      // Verificar se a transação já existe (baseado no ID da Pluggy)
      // Como não temos um campo específico para pluggy_id, vamos usar uma abordagem diferente
      const { data: existing } = await supabase
        .from('transacoes')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('descricao', transacaoData.descricao)
        .eq('valor', transacaoData.valor)
        .eq('data_transacao', transacaoData.data_transacao)
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
  
  console.log(`Processamento concluído: ${log.total_inserted} inseridas, ${log.total_ignored} ignoradas, ${log.errors.length} erros`);
}
