declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const trackCustomEvent = (eventName: string, data = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data);
  }
};
