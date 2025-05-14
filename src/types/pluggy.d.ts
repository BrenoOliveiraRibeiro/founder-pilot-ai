
/**
 * Pluggy Connect related type definitions
 */

interface PluggyConnectOptions {
  connectToken: string;
  includeSandbox?: boolean;
  [key: string]: any;
}

declare global {
  interface Window {
    PluggyConnect?: {
      create: (options: PluggyConnectOptions) => any;
    };
  }
}

export {};
