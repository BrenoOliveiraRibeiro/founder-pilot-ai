
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatBelvoError(errorData: any): string {
  if (!errorData) return "Erro desconhecido na conexão com o Belvo";
  
  if (errorData.errorType === "authentication_failure") {
    return "Falha na autenticação com a API Belvo. Verifique se as credenciais estão corretas.";
  }
  
  if (errorData.errorType === "test_link_failure") {
    return "Conexão com a API Belvo estabelecida, mas falha ao criar link de teste.";
  }
  
  if (typeof errorData.error === 'string' && errorData.error.includes("401")) {
    return "Credenciais inválidas para a API Belvo. Verifique seu Secret ID e Password.";
  }
  
  return errorData.message || "Erro na conexão com o Belvo. Verifique os logs para mais detalhes.";
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}
