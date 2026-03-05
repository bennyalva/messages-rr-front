type HttpErrorData = {
  status: number;
  message: string;
  url?: string;
};

type HttpErrorCallback = (data: HttpErrorData) => void;

const listeners: Set<HttpErrorCallback> = new Set();

export const httpErrorEmitter = {
  emit(data: HttpErrorData) {
    listeners.forEach((cb) => cb(data));
  },

  on(callback: HttpErrorCallback) {
    listeners.add(callback);
  },

  off(callback: HttpErrorCallback) {
    listeners.delete(callback);
  },
};

export type { HttpErrorData };
