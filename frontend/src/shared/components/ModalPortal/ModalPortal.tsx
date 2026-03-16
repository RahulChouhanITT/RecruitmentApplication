import { createPortal } from "react-dom";
import { useEffect, type PropsWithChildren } from "react";

type ModalPortalProps = PropsWithChildren<{
  isOpen: boolean;
}>;

const MODAL_COUNT_ATTRIBUTE = "data-modal-count";

export const ModalPortal = ({ isOpen, children }: ModalPortalProps) => {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const currentCount = Number(body.getAttribute(MODAL_COUNT_ATTRIBUTE) ?? "0");
    const nextCount = currentCount + 1;

    body.setAttribute(MODAL_COUNT_ATTRIBUTE, String(nextCount));
    body.style.overflow = "hidden";

    return () => {
      const activeCount = Number(body.getAttribute(MODAL_COUNT_ATTRIBUTE) ?? "0");
      const updatedCount = Math.max(0, activeCount - 1);

      if (updatedCount === 0) {
        body.removeAttribute(MODAL_COUNT_ATTRIBUTE);
        body.style.overflow = "";
        return;
      }

      body.setAttribute(MODAL_COUNT_ATTRIBUTE, String(updatedCount));
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
};
