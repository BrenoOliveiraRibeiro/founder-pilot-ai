
interface Account {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  balance: number;
  available_credit?: number;
  credit_limit?: number;
  available_credit_limit?: number;
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
  'savings_account',
  'current_account',
  'deposit_account'
];

// Subtipos considerados como débito
const DEBIT_ACCOUNT_SUBTYPES = [
  'checking_account',
  'savings_account',
  'salary_account',
  'current_account',
  'deposit_account'
];

// Tipos de conta considerados como crédito
const CREDIT_ACCOUNT_TYPES = [
  'credit_card',
  'credit',
  'card',
  'credit_account'
];

// Subtipos considerados como crédito
const CREDIT_ACCOUNT_SUBTYPES = [
  'credit_card',
  'credit_account'
];

export const isDebitAccount = (accountType: string, accountSubtype?: string): boolean => {
  const type = accountType.toLowerCase();
  const subtype = accountSubtype?.toLowerCase();
  
  console.log(`[ACCOUNT CLASSIFICATION] Type: ${type}, Subtype: ${subtype}`);
  
  // Verificar por subtipo primeiro (mais específico)
  if (subtype && DEBIT_ACCOUNT_SUBTYPES.includes(subtype)) {
    console.log(`[ACCOUNT CLASSIFICATION] Classified as DEBIT by subtype: ${subtype}`);
    return true;
  }
  
  if (subtype && CREDIT_ACCOUNT_SUBTYPES.includes(subtype)) {
    console.log(`[ACCOUNT CLASSIFICATION] Classified as CREDIT by subtype: ${subtype}`);
    return false;
  }
  
  // Fallback para tipo principal
  const isDebit = DEBIT_ACCOUNT_TYPES.includes(type);
  console.log(`[ACCOUNT CLASSIFICATION] Classified as ${isDebit ? 'DEBIT' : 'CREDIT'} by type: ${type}`);
  return isDebit;
};

export const isCreditAccount = (accountType: string, accountSubtype?: string): boolean => {
  const type = accountType.toLowerCase();
  const subtype = accountSubtype?.toLowerCase();
  
  // Verificar por subtipo primeiro (mais específico)
  if (subtype && CREDIT_ACCOUNT_SUBTYPES.includes(subtype)) {
    return true;
  }
  
  if (subtype && DEBIT_ACCOUNT_SUBTYPES.includes(subtype)) {
    return false;
  }
  
  // Fallback para tipo principal
  return CREDIT_ACCOUNT_TYPES.includes(type);
};

export const separateAccountsByType = (accounts: Account[]): SeparatedAccounts => {
  console.log(`[ACCOUNT SEPARATION] Processing ${accounts.length} accounts:`, accounts);
  
  const debitAccounts = accounts.filter(account => 
    isDebitAccount(account.type, account.subtype)
  );
  
  const creditAccounts = accounts.filter(account => 
    isCreditAccount(account.type, account.subtype)
  );

  console.log(`[ACCOUNT SEPARATION] Debit accounts (${debitAccounts.length}):`, debitAccounts);
  console.log(`[ACCOUNT SEPARATION] Credit accounts (${creditAccounts.length}):`, creditAccounts);

  // Calcular saldo real (apenas contas de débito)
  const realCashBalance = debitAccounts.reduce((sum, account) => {
    const balance = account.balance || 0;
    console.log(`[CASH BALANCE] Account ${account.name}: ${balance}`);
    return sum + balance;
  }, 0);

  console.log(`[CASH BALANCE] Total real cash balance: ${realCashBalance}`);

  // Calcular métricas de crédito usando os campos corretos da Pluggy
  const totalCreditLimit = creditAccounts.reduce((sum, account) => {
    const limit = account.credit_limit || 0;
    console.log(`[CREDIT LIMIT] Account ${account.name}: limit=${limit}`);
    return sum + limit;
  }, 0);

  const availableCreditLimit = creditAccounts.reduce((sum, account) => {
    // Usar available_credit_limit se disponível, senão calcular
    const available = account.available_credit_limit || 
                    account.available_credit || 
                    ((account.credit_limit || 0) - Math.abs(account.balance || 0));
    console.log(`[CREDIT AVAILABLE] Account ${account.name}: available=${available}`);
    return sum + available;
  }, 0);

  const usedCreditLimit = totalCreditLimit - availableCreditLimit;

  console.log(`[CREDIT METRICS] Total limit: ${totalCreditLimit}, Available: ${availableCreditLimit}, Used: ${usedCreditLimit}`);

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
  const percentage = (usedLimit / totalLimit) * 100;
  console.log(`[CREDIT UTILIZATION] Used: ${usedLimit}, Total: ${totalLimit}, Percentage: ${percentage}%`);
  return percentage;
};

export const formatAccountType = (type: string, subtype?: string): string => {
  const typeMap: Record<string, string> = {
    'checking': 'Conta Corrente',
    'checking_account': 'Conta Corrente',
    'current_account': 'Conta Corrente',
    'savings': 'Conta Poupança',
    'savings_account': 'Conta Poupança',
    'credit_card': 'Cartão de Crédito',
    'credit_account': 'Conta de Crédito',
    'salary': 'Conta Salário',
    'salary_account': 'Conta Salário',
    'investment': 'Conta Investimento',
    'deposit_account': 'Conta Depósito'
  };

  // Tentar subtipo primeiro
  if (subtype) {
    const formattedSubtype = typeMap[subtype.toLowerCase()];
    if (formattedSubtype) return formattedSubtype;
  }

  // Fallback para tipo principal
  return typeMap[type.toLowerCase()] || type;
};
