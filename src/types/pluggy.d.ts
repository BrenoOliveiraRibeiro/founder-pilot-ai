
declare global {
  interface Window {
    PluggyConnect?: {
      init: (config: {
        connectToken: string;
        includeSandbox?: boolean;
        onSuccess: (data: { itemId: string; item: any }) => void;
        onError: (error: any) => void;
        onClose: () => void;
        onOpen?: () => void;
        onLoad?: () => void;
        updateCredentials?: (data: any) => void;
        onEvent?: (data: any) => void;
      }) => {
        mount: (element: HTMLElement) => void;
        unmount: () => void;
        destroy: () => void;
      };
    };
  }
}

export {};
