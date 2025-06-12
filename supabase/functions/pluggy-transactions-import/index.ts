
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  currencyCode: string;
  date: string;
  accountId: string;
  categoryId?: string;
  category?: string;
  type?: string;
  balance?: number;
}

interface ImportLog {
  totalProcessed: number;
  totalInserted: number;
  totalIgnored: number;
  errors: string[];
  csvBackupPath?: string;
}

serve(async (req) => {
  console.log("=== Pluggy Transactions Import Function ===");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Environment validation
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
    const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

    if (!supabaseServiceKey || !pluggyClientId || !pluggyClientSecret) {
      throw new Error("Credenciais necessárias não configuradas");
    }

    const requestData = await req.json();
    const { empresa_id, item_id, sandbox = true } = requestData;

    if (!empresa_id || !item_id) {
      return new Response(
        JSON.stringify({ error: "empresa_id e item_id são obrigatórios" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Iniciando importação de transações para empresa ${empresa_id}, item ${item_id}`);

    // 1. Autenticar na API da Pluggy
    const apiKey = await authenticatePluggy(pluggyClientId, pluggyClientSecret);
    console.log("Autenticação na Pluggy realizada com sucesso");

    // 2. Buscar transações da API Pluggy
    const transactions = await fetchAllTransactions(apiKey, item_id);
    console.log(`Total de transações obtidas: ${transactions.length}`);

    // 3. Converter para CSV e salvar backup
    const csvContent = convertToCSV(transactions);
    const csvBackupPath = await saveCSVBackup(csvContent, empresa_id);
    console.log(`Backup CSV salvo: ${csvBackupPath}`);

    // 4. Importar para Supabase
    const importLog = await importToSupabase(supabase, transactions, empresa_id);
    importLog.csvBackupPath = csvBackupPath;

    console.log("Importação concluída:", importLog);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transações importadas com sucesso",
        log: importLog
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro na importação de transações:", error);
    return new Response(
      JSON.stringify({
        error: "Falha na importação de transações",
        message: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Função para autenticar na API Pluggy com retry
async function authenticatePluggy(clientId: string, clientSecret: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Tentativa de autenticação ${attempt}/${retries}`);
      
      const response = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error);
      if (attempt === retries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error("Falha na autenticação após todas as tentativas");
}

// Função para buscar todas as transações com paginação
async function fetchAllTransactions(apiKey: string, itemId: string): Promise<PluggyTransaction[]> {
  const allTransactions: PluggyTransaction[] = [];
  let page = 1;
  const pageSize = 500; // Máximo permitido pela API
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      console.log(`Buscando transações - página ${page}`);
      
      const response = await fetch(`https://api.pluggy.ai/transactions?itemId=${itemId}&page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar transações: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const transactions = data.results || [];
      
      console.log(`Página ${page}: ${transactions.length} transações obtidas`);
      
      allTransactions.push(...transactions);
      
      // Verificar se há mais páginas
      hasMorePages = transactions.length === pageSize;
      page++;
      
      // Delay entre requests para evitar rate limiting
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`Erro na página ${page}:`, error);
      // Para evitar loops infinitos, paramos em caso de erro
      hasMorePages = false;
      throw error;
    }
  }

  return allTransactions;
}

// Função para converter JSON para CSV
function convertToCSV(transactions: PluggyTransaction[]): string {
  if (transactions.length === 0) {
    return "id,description,amount,currencyCode,date,accountId,categoryId,category,type,balance\n";
  }

  // Cabeçalho CSV
  const headers = "id,description,amount,currencyCode,date,accountId,categoryId,category,type,balance\n";
  
  // Converter cada transação para linha CSV
  const rows = transactions.map(transaction => {
    return [
      escapeCSVField(transaction.id || ''),
      escapeCSVField(transaction.description || ''),
      transaction.amount || 0,
      escapeCSVField(transaction.currencyCode || 'BRL'),
      escapeCSVField(transaction.date || ''),
      escapeCSVField(transaction.accountId || ''),
      escapeCSVField(transaction.categoryId || ''),
      escapeCSVField(transaction.category || ''),
      escapeCSVField(transaction.type || ''),
      transaction.balance || 0
    ].join(',');
  }).join('\n');

  return headers + rows;
}

// Função para escapar campos CSV
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Função para salvar backup CSV
async function saveCSVBackup(csvContent: string, empresaId: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `transactions_backup_${empresaId}_${timestamp}.csv`;
  const filepath = `/tmp/${filename}`;
  
  try {
    await Deno.writeTextFile(filepath, csvContent);
    console.log(`Backup CSV salvo em: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("Erro ao salvar backup CSV:", error);
    return `Erro ao salvar backup: ${error.message}`;
  }
}

// Função para importar transações para Supabase
async function importToSupabase(
  supabase: any, 
  transactions: PluggyTransaction[], 
  empresaId: string
): Promise<ImportLog> {
  const log: ImportLog = {
    totalProcessed: transactions.length,
    totalInserted: 0,
    totalIgnored: 0,
    errors: []
  };

  console.log(`Iniciando importação de ${transactions.length} transações para Supabase`);

  // Buscar transações existentes para verificar duplicatas
  const { data: existingTransactions, error: fetchError } = await supabase
    .from("transacoes")
    .select("id")
    .eq("empresa_id", empresaId);

  if (fetchError) {
    console.error("Erro ao buscar transações existentes:", fetchError);
    log.errors.push(`Erro ao buscar transações existentes: ${fetchError.message}`);
  }

  const existingIds = new Set(existingTransactions?.map((t: any) => t.id) || []);
  console.log(`Encontradas ${existingIds.size} transações existentes`);

  // Processar transações em lotes
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < transactions.length; i += batchSize) {
    batches.push(transactions.slice(i, i + batchSize));
  }

  console.log(`Processando ${batches.length} lotes de ${batchSize} transações`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`Processando lote ${batchIndex + 1}/${batches.length}`);

    const transactionsToInsert = batch
      .filter(transaction => !existingIds.has(transaction.id))
      .map(transaction => ({
        id: transaction.id,
        empresa_id: empresaId,
        descricao: transaction.description || 'Transação sem descrição',
        valor: transaction.amount || 0,
        data_transacao: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        categoria: transaction.category || 'Sem categoria',
        tipo: transaction.amount >= 0 ? 'receita' : 'despesa',
        metodo_pagamento: 'Transferência',
        recorrente: false
      }));

    if (transactionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("transacoes")
        .insert(transactionsToInsert);

      if (insertError) {
        console.error(`Erro ao inserir lote ${batchIndex + 1}:`, insertError);
        log.errors.push(`Lote ${batchIndex + 1}: ${insertError.message}`);
      } else {
        log.totalInserted += transactionsToInsert.length;
        console.log(`Lote ${batchIndex + 1}: ${transactionsToInsert.length} transações inseridas`);
      }
    }

    log.totalIgnored += batch.length - transactionsToInsert.length;

    // Pequeno delay entre lotes
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Importação concluída: ${log.totalInserted} inseridas, ${log.totalIgnored} ignoradas`);
  return log;
}
