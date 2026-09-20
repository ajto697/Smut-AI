export interface ToastMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
const listeners = new Set<ToastListener>();

export const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

export const showCyberToast = (toast: Omit<ToastMessage, 'id'>) => {
  const id = 'toast_' + Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = {
    id,
    duration: 4000,
    ...toast
  };

  toasts = [...toasts, newToast];
  notifyListeners();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissCyberToast(id);
    }, newToast.duration);
  }
  return id;
};

export const dismissCyberToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

export const subscribeToToasts = (listener: ToastListener) => {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
};
