
export async function saveTransactionsBatch(
  transactions: any[], 
  supabaseClient: any
) {
  console.log(`Tentando inserir ${transactions.length} transações usando upsert`);
  
  let insertedCount = 0;
  let duplicateCount = 0;
  
  // Processar em lotes otimizados para upsert
  const batchSize = 100;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    
    try {
      console.log(`Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(transactions.length / batchSize)}: ${batch.length} transações`);
      
      // Usar upsert em vez de insert para otimizar
      const { data, error } = await supabaseClient
        .from("transacoes")
        .upsert(batch, {
          onConflict: 'transaction_hash',
          ignoreDuplicates: false
        })
        .select('id');
      
      if (error) {
        console.error(`Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
        // Fallback para processamento individual
        const fallbackResult = await processBatchFallback(batch, supabaseClient);
        insertedCount += fallbackResult.inserted;
        duplicateCount += fallbackResult.duplicates;
      } else {
        const batchInserted = data ? data.length : 0;
        insertedCount += batchInserted;
        console.log(`Lote ${Math.floor(i / batchSize) + 1}: ${batchInserted} transações processadas com sucesso`);
      }
    } catch (batchError) {
      console.error(`Erro crítico no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
      // Fallback para processamento individual
      const fallbackResult = await processBatchFallback(batch, supabaseClient);
      insertedCount += fallbackResult.inserted;
      duplicateCount += fallbackResult.duplicates;
    }
  }
  
  return { insertedCount, duplicateCount };
}

async function processBatchFallback(batch: any[], supabaseClient: any) {
  let inserted = 0;
  let duplicates = 0;
  
  for (const tx of batch) {
    try {
      const { data: singleData, error: singleError } = await supabaseClient
        .from("transacoes")
        .upsert([tx], {
          onConflict: 'transaction_hash',
          ignoreDuplicates: false
        })
        .select('id');
      
      if (!singleError) {
        inserted++;
      } else if (singleError.code === '23505') {
        duplicates++;
      }
    } catch (singleTxError) {
      console.error('Erro individual:', singleTxError);
      duplicates++;
    }
  }
  
  return { inserted, duplicates };
}
