// Global type declarations

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | { [key: string]: any },
      config?: { [key: string]: any }
    ) => void;
  }
}

export {};