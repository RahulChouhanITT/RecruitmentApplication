import type { ModalProps } from "./AuthModal.types";
import {
  ModalActions,
  ModalButton,
  ModalCard,
  ModalMessage,
  ModalOverlay,
  ModalPrimaryButton,
  ModalTitle,
} from "./AuthModal.styles";

export const AuthModal = ({
  isOpen,
  title,
  message,
  onClose,
  closeLabel = "Cancel",
  primaryLabel,
  onPrimaryAction,
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay >
      <ModalCard>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ModalActions>
          {primaryLabel && onPrimaryAction ? (
            <ModalPrimaryButton type="button" onClick={onPrimaryAction}>
              {primaryLabel}
            </ModalPrimaryButton>
          ) : null}
          <ModalButton type="button" onClick={onClose}>
            {closeLabel}
          </ModalButton>
        </ModalActions>
      </ModalCard>
    </ModalOverlay>
  );
};
