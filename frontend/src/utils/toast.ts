export type ToastType = 'success' | 'error' | 'info';

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
} as const;

export type ToastPayload = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

export const TOAST_EVENT_NAME = 'app:toast';

export const showToast = ({
  message,
  type = TOAST_TYPES.INFO,
  durationMs = 3000,
}: ToastPayload): void => {
  if (!message) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        message,
        type,
        durationMs,
      },
    }),
  );
};
