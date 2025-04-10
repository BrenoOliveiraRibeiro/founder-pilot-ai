
// Formatador para valores monetários grandes
export const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `R$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `R$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}K`;
  } else {
    return `R$${value.toFixed(0)}`;
  }
};
