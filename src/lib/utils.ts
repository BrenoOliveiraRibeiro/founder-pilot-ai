
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// Add this function if it doesn't exist already
export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

// Adicionar formatBelvoError para resolver o erro
export const formatBelvoError = (error: any): string => {
  if (!error) return "Erro desconhecido";
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.error && typeof error.error === 'string') return error.error;
  
  if (error.detail) return error.detail;
  
  return "Ocorreu um erro na conexão com os serviços financeiros";
};
