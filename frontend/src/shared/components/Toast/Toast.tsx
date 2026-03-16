import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT_NAME, type ToastPayload, type ToastType } from "../../../utils/toast";
import { ToastItem, ToastViewport } from "./Toast.styles";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export const Toast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onToast = (event: Event): void => {
      const customEvent = event as CustomEvent<ToastPayload>;
      const message = customEvent.detail?.message;
      const type = customEvent.detail?.type ?? "info";
      const durationMs = customEvent.detail?.durationMs ?? 3000;

      if (!message) {
        return;
      }

      idRef.current += 1;
      const id = idRef.current;

      setToasts((previous) => [...previous, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
      }, durationMs);
    };

    window.addEventListener(TOAST_EVENT_NAME, onToast as EventListener);

    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, onToast as EventListener);
    };
  }, []);

  if (!toasts.length) {
    return null;
  }

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type}>
          {toast.message}
        </ToastItem>
      ))}
    </ToastViewport>
  );
};
