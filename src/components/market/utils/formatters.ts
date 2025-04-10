
// Formatador para valores monetários grandes
export const formatCurrency = (value: number) => {
  if (!value && value !== 0) return "R$0";
  
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

// Formata valores percentuais
export const formatPercentage = (value: number) => {
  if (!value && value !== 0) return "0%";
  return `${value.toFixed(1)}%`;
};

// Formata datas para exibição
export const formatDate = (date: Date | string) => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Formata grandes números sem símbolo monetário
export const formatLargeNumber = (value: number) => {
  if (!value && value !== 0) return "0";
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toFixed(0);
  }
};
