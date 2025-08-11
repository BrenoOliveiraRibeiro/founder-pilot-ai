
import { getPluggyToken, callPluggyAPI, gerarInsights } from "./utils.ts";

export async function processFinancialData(
  empresaId: string, 
  itemId: string, 
  accountId: string | null, 
  transactionsData: any,
  apiKey: string | null,
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  sandbox: boolean, 
  supabaseClient: any
) {
  try {
    console.log(`Iniciando processamento de dados financeiros para empresa ${empresaId}, item ${itemId}, sandbox: ${sandbox}`);
    
    // Get API key if not provided
    if (!apiKey) {
      const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
      if (!tokenResult.success) {
        throw new Error("Falha ao obter token da API Pluggy");
      }
      apiKey = tokenResult.data.apiKey;
    }
    
    // Get account data to determine which account to use
    let targetAccountId = accountId;
    let accountData = null;
    
    if (!targetAccountId) {
      console.log(`Buscando contas para item ${itemId}`);
      const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
      
      if (accountsResult.success && accountsResult.data.results && accountsResult.data.results.length > 0) {
        // Use the first account by default
        targetAccountId = accountsResult.data.results[0].id;
        accountData = accountsResult.data.results[0];
        console.log(`Usando conta padrão: ${targetAccountId} (${accountData.name})`);
      } else {
        // If account fetch failed due to auth, try to get fresh token and retry
        if (accountsResult.error?.status === 403 || accountsResult.error?.status === 401) {
          console.log('Falha de autenticação ao buscar contas, tentando renovar token...');
          const freshTokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
          
          if (freshTokenResult.success) {
            const freshApiKey = freshTokenResult.data.apiKey;
            console.log('Token renovado, tentando buscar contas novamente...');
            
            const retryAccountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', freshApiKey);
            if (retryAccountsResult.success && retryAccountsResult.data.results && retryAccountsResult.data.results.length > 0) {
              targetAccountId = retryAccountsResult.data.results[0].id;
              accountData = retryAccountsResult.data.results[0];
              console.log(`Conta obtida após renovação do token: ${targetAccountId} (${accountData.name})`);
              // Update apiKey for subsequent calls
              apiKey = freshApiKey;
            } else {
              console.warn("Nenhuma conta encontrada mesmo após renovação do token:", itemId);
              return {
                success: true,
                message: "Nenhuma conta encontrada",
                newTransactions: 0,
                duplicates: 0,
                total: 0
              };
            }
          } else {
            console.error('Falha ao renovar token:', freshTokenResult.error);
            return {
              success: true,
              message: "Falha na autenticação - token inválido",
              newTransactions: 0,
              duplicates: 0,
              total: 0
            };
          }
        } else {
          console.warn("Nenhuma conta encontrada para o item:", itemId);
          return {
            success: true,
            message: "Nenhuma conta encontrada",
            newTransactions: 0,
            duplicates: 0,
            total: 0
          };
        }
      }
    }
    
    // Use provided transactions data or fetch from API
    let allTransactions = [];
    
    if (transactionsData && transactionsData.results) {
      console.log(`Usando transações fornecidas: ${transactionsData.results.length}`);
      allTransactions = transactionsData.results;
    } else {
      // Fetch from API with extended date range to ensure we get all recent data
      console.log(`Buscando transações da API para conta ${targetAccountId}`);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // Increased to 6 months for better sync
      
      const fromDate = sixMonthsAgo.toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      console.log(`Período de sincronização: ${fromDate} até ${toDate}`);
      
      const transactionsResult = await callPluggyAPI(
        `/transactions?accountId=${targetAccountId}&from=${fromDate}&to=${toDate}`, 
        'GET',
        apiKey
      );
      
      if (transactionsResult.success && transactionsResult.data.results) {
        allTransactions = transactionsResult.data.results;
        console.log(`Transações obtidas da API: ${allTransactions.length}`);
      } else {
        console.warn(`Erro ao buscar transações para a conta ${targetAccountId}:`, transactionsResult.error);
        
        // If API call failed due to auth, try to get fresh token and retry once
        if (transactionsResult.error?.status === 403 || transactionsResult.error?.status === 401) {
          console.log('Token possivelmente expirado, tentando renovar...');
          const freshTokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
          
          if (freshTokenResult.success) {
            const freshApiKey = freshTokenResult.data.apiKey;
            console.log('Token renovado, tentando buscar transações novamente...');
            
            const retryTransactionsResult = await callPluggyAPI(
              `/transactions?accountId=${targetAccountId}&from=${fromDate}&to=${toDate}`, 
              'GET',
              freshApiKey
            );
            
            if (retryTransactionsResult.success && retryTransactionsResult.data.results) {
              allTransactions = retryTransactionsResult.data.results;
              console.log(`Transações obtidas após renovação do token: ${allTransactions.length}`);
            } else {
              console.error('Falha mesmo com token renovado:', retryTransactionsResult.error);
              allTransactions = [];
            }
          } else {
            console.error('Falha ao renovar token:', freshTokenResult.error);
            allTransactions = [];
          }
        } else {
          allTransactions = [];
        }
      }
    }
    
    console.log(`Processando ${allTransactions.length} transações`);
    
    if (allTransactions.length === 0) {
      console.log("Nenhuma transação para processar");
      return {
        success: true,
        message: "Nenhuma transação encontrada para processar",
        newTransactions: 0,
        duplicates: 0,
        total: 0
      };
    }
    
    // Preparar transações formatadas para inserção
    const transacoesFormatadas = allTransactions.map(tx => {
      // Melhorar classificação de categoria baseada na descrição e tipo
      let categoria = tx.category || 'Outros';
      let metodo_pagamento = tx.type || 'Transferência';
      
      const descricao = (tx.description || 'Transação').toLowerCase();
      
      // Classificação mais inteligente baseada na descrição e valor
      if (descricao.includes('pix')) {
        categoria = tx.amount > 0 ? 'Transfer - PIX' : 'PIX Enviado';
        metodo_pagamento = 'PIX';
      } else if (descricao.includes('salario') || descricao.includes('salary') || descricao.includes('folha')) {
        categoria = 'Salário';
        metodo_pagamento = 'Transferência';
      } else if (descricao.includes('ted') || descricao.includes('doc')) {
        metodo_pagamento = tx.amount > 0 ? 'TED/DOC Recebido' : 'TED/DOC Enviado';
        categoria = tx.amount > 0 ? 'Receita' : 'Transferência';
      } else if (tx.amount > 0) {
        // Para valores positivos sem categoria específica, classificar como receita
        categoria = categoria === 'Outros' ? 'Receita' : categoria;
      }
      
      const tipoTransacao = tx.amount > 0 ? 'receita' : 'despesa';
      
      return {
        empresa_id: empresaId,
        descricao: tx.description || 'Transação',
        valor: Math.abs(tx.amount), // Sempre valor absoluto
        data_transacao: tx.date,
        categoria: categoria,
        tipo: tipoTransacao,
        metodo_pagamento: metodo_pagamento,
        recorrente: false
        // transaction_hash será gerado automaticamente pelo trigger
      };
    });
    
    console.log(`[FINANCIAL] Transações formatadas para inserção: ${transacoesFormatadas.length}`);
    
    const receitas = transacoesFormatadas.filter(tx => tx.tipo === 'receita');
    const despesas = transacoesFormatadas.filter(tx => tx.tipo === 'despesa');
    
    console.log('[FINANCIAL] Receitas encontradas:', receitas.map(tx => ({
      descricao: tx.descricao,
      valor: tx.valor,
      data: tx.data_transacao,
      categoria: tx.categoria
    })));
    
    console.log('[FINANCIAL] Despesas encontradas:', despesas.map(tx => ({
      descricao: tx.descricao,
      valor: tx.valor,
      data: tx.data_transacao,
      categoria: tx.categoria
    })));
    
    console.log(`Tentando inserir ${transacoesFormatadas.length} transações`);
    
    // Inserir transações com tratamento adequado de duplicatas
    let insertedCount = 0;
    let duplicateCount = 0;
    
    // Processar em lotes para melhor performance
    const batchSize = 50;
    for (let i = 0; i < transacoesFormatadas.length; i += batchSize) {
      const batch = transacoesFormatadas.slice(i, i + batchSize);
      
      try {
        console.log(`[FINANCIAL] Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(transacoesFormatadas.length / batchSize)}: ${batch.length} transações`);
        
        const { data, error } = await supabaseClient
          .from("transacoes")
          .insert(batch)
          .select('id');
        
        if (error) {
          console.error(`[FINANCIAL] Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
          
          // Se há erro de constraint (duplicata), processar individualmente para contar
          if (error.code === '23505') {
            console.log(`[FINANCIAL] Lote com duplicatas detectadas, processando individualmente...`);
            
            for (const tx of batch) {
              try {
                console.log(`[FINANCIAL] Inserindo transação individual: ${tx.descricao} - ${tx.tipo} - R$ ${tx.valor}`);
                
                const { data: singleData, error: singleError } = await supabaseClient
                  .from("transacoes")
                  .insert([tx])
                  .select('id');
                
                if (singleError) {
                  if (singleError.code === '23505') {
                    console.log(`[FINANCIAL] Transação duplicada ignorada: ${tx.descricao}`);
                    duplicateCount++;
                  } else {
                    console.error('[FINANCIAL] Erro inesperado ao inserir transação:', singleError, 'Transação:', tx);
                  }
                } else {
                  console.log(`[FINANCIAL] Transação inserida com sucesso: ${tx.descricao} - ${tx.tipo} - R$ ${tx.valor}`);
                  insertedCount++;
                }
              } catch (singleTxError) {
                console.error('[FINANCIAL] Erro individual crítico:', singleTxError);
                duplicateCount++;
              }
            }
          } else {
            console.error(`[FINANCIAL] Erro não relacionado a duplicatas no lote:`, error);
            // Tentar inserir individualmente mesmo com outros erros
            for (const tx of batch) {
              try {
                const { error: singleError } = await supabaseClient
                  .from("transacoes")
                  .insert([tx])
                  .select('id');
                
                if (singleError) {
                  console.error(`[FINANCIAL] Erro individual na transação:`, singleError, 'Transação:', tx);
                  if (singleError.code === '23505') {
                    duplicateCount++;
                  }
                } else {
                  insertedCount++;
                }
              } catch (singleTxError) {
                console.error('[FINANCIAL] Erro individual crítico:', singleTxError);
              }
            }
          }
        } else {
          const batchInserted = data ? data.length : 0;
          insertedCount += batchInserted;
          console.log(`[FINANCIAL] Lote ${Math.floor(i / batchSize) + 1}: ${batchInserted} transações inseridas com sucesso`);
        }
      } catch (batchError) {
        console.error(`Erro crítico no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
        // Em caso de erro crítico, tentar individualmente
        for (const tx of batch) {
          try {
            const { error: singleError } = await supabaseClient
              .from("transacoes")
              .insert([tx])
              .select('id');
            
            if (singleError) {
              if (singleError.code === '23505') {
                duplicateCount++;
              } else {
                console.error('Erro ao inserir transação individual:', singleError);
              }
            } else {
              insertedCount++;
            }
          } catch (singleTxError) {
            console.error('Erro individual crítico:', singleTxError);
            duplicateCount++;
          }
        }
      }
    }
    
    console.log(`Resultado final: ${insertedCount} novas transações inseridas, ${duplicateCount} duplicatas ignoradas`);
    
    // Calcular métricas apenas se houver transações novas
    if (insertedCount > 0) {
      console.log('Atualizando métricas devido a novas transações...');
      
      // Buscar dados da conta para calcular métricas se não tivermos
      if (!accountData && targetAccountId) {
        const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
        if (accountsResult.success && accountsResult.data.results) {
          accountData = accountsResult.data.results.find((acc: any) => acc.id === targetAccountId);
        }
      }
      
      // Buscar todas as transações da empresa para calcular métricas
      const { data: todasTransacoes, error: txError } = await supabaseClient
        .from("transacoes")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("data_transacao", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      if (!txError && todasTransacoes) {
        const receitas = todasTransacoes.filter(tx => tx.valor > 0);
        const despesas = todasTransacoes.filter(tx => tx.valor < 0);
        
        const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.valor), 0) / 3;
        const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.valor, 0)) / 3;
        const caixaAtual = accountData ? accountData.balance : 0;
        const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
        const cashFlow = receitaMensal - burnRate;
        
        // Atualizar métricas
        const { error: metricasError } = await supabaseClient
          .from("metricas")
          .upsert([{
            empresa_id: empresaId,
            data_referencia: new Date().toISOString().split('T')[0],
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: cashFlow,
            mrr_growth: 0
          }], {
            onConflict: 'empresa_id,data_referencia'
          });
          
        if (metricasError) {
          console.error("Erro ao salvar métricas:", metricasError);
        } else {
          console.log("Métricas atualizadas:", { receitaMensal, burnRate, runwayMeses });
        }
        
        // Gerar insights apenas se houve mudanças significativas
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
      }
    } else {
      console.log('Nenhuma transação nova - métricas não atualizadas');
    }
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    
    // Determinar mensagem de retorno
    let message = "";
    if (insertedCount > 0) {
      message = `${insertedCount} novas transações processadas`;
      if (duplicateCount > 0) {
        message += ` (${duplicateCount} duplicatas ignoradas)`;
      }
    } else if (duplicateCount > 0) {
      message = "Nenhuma transação nova - todas já estão salvas";
    } else {
      message = "Nenhuma transação nova encontrada";
    }
    
    return {
      success: true,
      message: message,
      newTransactions: insertedCount,
      duplicates: duplicateCount,
      total: allTransactions.length
    };
  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    throw error;
  }
}
