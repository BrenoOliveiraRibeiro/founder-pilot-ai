interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  available_credit?: number;
  credit_limit?: number;
  due_date?: string;
}

interface SeparatedAccounts {
  debitAccounts: Account[];
  creditAccounts: Account[];
  realCashBalance: number;
  totalCreditLimit: number;
  usedCreditLimit: number;
  availableCreditLimit: number;
}

// Tipos de conta considerados como débito (dinheiro real)
const DEBIT_ACCOUNT_TYPES = [
  'checking',
  'savings',
  'salary',
  'investment',
  'checking_account',
  'savings_account'
];

// Tipos de conta considerados como crédito
const CREDIT_ACCOUNT_TYPES = [
  'credit_card',
  'credit',
  'card'
];

export const isDebitAccount = (accountType: string): boolean => {
  return DEBIT_ACCOUNT_TYPES.includes(accountType.toLowerCase());
};

export const isCreditAccount = (accountType: string): boolean => {
  return CREDIT_ACCOUNT_TYPES.includes(accountType.toLowerCase());
};

export const separateAccountsByType = (accounts: Account[]): SeparatedAccounts => {
  const debitAccounts = accounts.filter(account => isDebitAccount(account.type));
  const creditAccounts = accounts.filter(account => isCreditAccount(account.type));

  // Calcular saldo real (apenas contas de débito)
  const realCashBalance = debitAccounts.reduce((sum, account) => {
    return sum + (account.balance || 0);
  }, 0);

  // Calcular métricas de crédito
  const totalCreditLimit = creditAccounts.reduce((sum, account) => {
    return sum + (account.credit_limit || 0);
  }, 0);

  const usedCreditLimit = creditAccounts.reduce((sum, account) => {
    // Para cartões de crédito, o balance negativo representa valor devido
    const used = Math.abs(account.balance || 0);
    return sum + used;
  }, 0);

  const availableCreditLimit = totalCreditLimit - usedCreditLimit;

  return {
    debitAccounts,
    creditAccounts,
    realCashBalance,
    totalCreditLimit,
    usedCreditLimit,
    availableCreditLimit
  };
};

export const getCreditUtilizationPercentage = (usedLimit: number, totalLimit: number): number => {
  if (totalLimit === 0) return 0;
  return (usedLimit / totalLimit) * 100;
};

export const formatAccountType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'checking': 'Conta Corrente',
    'savings': 'Conta Poupança',
    'credit_card': 'Cartão de Crédito',
    'salary': 'Conta Salário',
    'investment': 'Conta Investimento',
    'checking_account': 'Conta Corrente',
    'savings_account': 'Conta Poupança'
  };

  return typeMap[type.toLowerCase()] || type;
};