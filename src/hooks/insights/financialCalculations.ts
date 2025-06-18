
export const calculateFinancialMetrics = (transacoes: any[], metricas?: any) => {
  let caixaAtual = 0;
  let receitaMensal = 0;
  let burnRate = 0;
  let runwayMeses = 0;

  if (transacoes && transacoes.length > 0) {
    // Separar receitas e despesas
    const receitas = transacoes.filter(t => t.tipo === 'receita' && t.valor > 0);
    const despesas = transacoes.filter(t => t.tipo === 'despesa' && t.valor < 0);

    // Calcular receita mensal (média dos últimos 3 meses)
    const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
    receitaMensal = totalReceitas / 3;

    // Calcular burn rate (média das despesas dos últimos 3 meses)
    const totalDespesas = despesas.reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
    burnRate = totalDespesas / 3;

    // Usar caixa atual das métricas se disponível, senão calcular saldo
    if (metricas && metricas.caixa_atual) {
      caixaAtual = Number(metricas.caixa_atual);
    } else {
      caixaAtual = transacoes.reduce((saldo, t) => saldo + Number(t.valor), 0);
      if (caixaAtual < 0) caixaAtual = Math.abs(caixaAtual);
    }

    // Calcular runway (em meses)
    runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
  } else if (metricas) {
    caixaAtual = Number(metricas.caixa_atual) || 0;
    receitaMensal = Number(metricas.receita_mensal) || 0;
    burnRate = Number(metricas.burn_rate) || 0;
    runwayMeses = Number(metricas.runway_meses) || 0;
  }

  return { caixaAtual, receitaMensal, burnRate, runwayMeses };
};
