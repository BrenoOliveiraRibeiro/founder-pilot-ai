
export interface PluggyAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface PluggyTransaction {
  id: string;
  account_id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  type: 'debit' | 'credit';
}

export interface PluggyConnectionData {
  itemId: string;
  accountData: {
    results: PluggyAccount[];
  };
  transactionsData?: {
    results: PluggyTransaction[];
  };
  isConnected: boolean;
  connectionToken?: string;
}

export interface TransactionCacheEntry {
  data: PluggyTransaction[] | null;
  lastSync: number;
  accountId: string;
  itemId: string;
}

export interface TransactionCacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  hitRate: number;
}

export interface ConnectionManagerOptions {
  autoSave?: boolean;
  validateData?: boolean;
  enableCache?: boolean;
}

export interface DataSyncOptions {
  forceRefresh?: boolean;
  skipCache?: boolean;
  maxRetries?: number;
}
