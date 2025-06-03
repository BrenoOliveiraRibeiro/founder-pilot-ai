
// Definições de tipos para Pluggy Connect seguindo documentação oficial
declare global {
  interface Window {
    PluggyConnect: {
      init: (options: PluggyInitOptions) => PluggyInstance;
    };
  }
}

interface PluggyInitOptions {
  connectToken: string;
  includeSandbox?: boolean;
  connectorId?: string;
  onSuccess?: (data: { itemId: string; [key: string]: any }) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

interface PluggyInstance {
  render: (container: HTMLElement) => void;
  destroy?: () => void;
}

export {};
