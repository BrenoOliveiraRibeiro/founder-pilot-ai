
export const calculateFinancialMetrics = (transacoes: any[], metricas?: any) => {
  let caixaAtual = 0;
  let receitaMensal = 0;
  let burnRate = 0;
  let runwayMeses = 0;

  console.log("Calculando métricas financeiras...", { 
    transacoesCount: transacoes?.length || 0, 
    hasMetricas: !!metricas 
  });

  if (transacoes && transacoes.length > 0) {
    // Calcular saldo atual acumulativo
    const saldoTransacoes = transacoes.reduce((acc, t) => {
      const valor = Number(t.valor) || 0;
      return acc + valor;
    }, 0);

    // Usar caixa atual das métricas se disponível, senão usar saldo das transações
    if (metricas && metricas.caixa_atual && Number(metricas.caixa_atual) > 0) {
      caixaAtual = Number(metricas.caixa_atual);
    } else {
      caixaAtual = Math.abs(saldoTransacoes); // Garantir valor positivo para caixa
    }

    // Separar receitas e despesas dos últimos 90 dias
    const hoje = new Date();
    const tresMesesAtras = new Date(hoje.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const transacoesRecentes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data_transacao);
      return dataTransacao >= tresMesesAtras;
    });

    const receitas = transacoesRecentes.filter(t => {
      const valor = Number(t.valor);
      return valor > 0 && (t.tipo === 'receita' || valor > 0);
    });

    const despesas = transacoesRecentes.filter(t => {
      const valor = Number(t.valor);
      return valor < 0 && (t.tipo === 'despesa' || valor < 0);
    });

    console.log("Transações analisadas:", {
      receitasCount: receitas.length,
      despesasCount: despesas.length,
      periodo: "últimos 90 dias"
    });

    // Calcular receita mensal média
    if (receitas.length > 0) {
      const totalReceitas = receitas.reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
      receitaMensal = totalReceitas / 3; // Média mensal dos últimos 3 meses
    }

    // Calcular burn rate (despesas mensais médias)
    if (despesas.length > 0) {
      const totalDespesas = despesas.reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
      burnRate = totalDespesas / 3; // Média mensal dos últimos 3 meses
    }

    // Calcular runway apenas se temos burn rate positivo
    if (burnRate > 0 && caixaAtual > 0) {
      runwayMeses = caixaAtual / burnRate;
    } else if (burnRate === 0 && receitaMensal > 0) {
      runwayMeses = 999; // Runway "infinito" se não há despesas
    }

  } else if (metricas) {
    // Usar dados das métricas como fallback
    caixaAtual = Number(metricas.caixa_atual) || 0;
    receitaMensal = Number(metricas.receita_mensal) || 0;
    burnRate = Number(metricas.burn_rate) || 0;
    runwayMeses = Number(metricas.runway_meses) || 0;
  }

  const resultado = { 
    caixaAtual: Math.max(0, caixaAtual), // Garantir valor não-negativo
    receitaMensal: Math.max(0, receitaMensal), 
    burnRate: Math.max(0, burnRate), 
    runwayMeses: Math.max(0, runwayMeses) 
  };

  console.log("Métricas calculadas:", resultado);
  return resultado;
};
