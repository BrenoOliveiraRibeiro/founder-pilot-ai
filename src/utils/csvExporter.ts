import { format } from "date-fns";
import { pt } from "date-fns/locale";

export interface TransactionExportData {
  data_transacao: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  metodo_pagamento?: string;
  nome_banco?: string;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatCurrencyForCSV = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDateForCSV = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: pt });
  } catch {
    return dateString;
  }
};

export const generateCSVContent = (transactions: TransactionExportData[]): string => {
  const headers = [
    'Data',
    'Descrição',
    'Valor (R$)',
    'Tipo',
    'Categoria',
    'Método de Pagamento',
    'Banco'
  ];

  const csvContent = [
    headers.join(';'),
    ...transactions.map(transaction => [
      formatDateForCSV(transaction.data_transacao),
      `"${transaction.descricao.replace(/"/g, '""')}"`,
      formatCurrencyForCSV(transaction.valor),
      transaction.tipo,
      transaction.categoria,
      transaction.metodo_pagamento || '',
      transaction.nome_banco || ''
    ].join(';'))
  ].join('\n');

  // Add BOM for proper UTF-8 handling in Excel
  return '\uFEFF' + csvContent;
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const generateFileName = (startDate: Date, endDate: Date): string => {
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
  
  return `transacoes_${start}_${end}_${timestamp}.csv`;
};