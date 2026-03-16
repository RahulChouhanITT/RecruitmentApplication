import type { AuthModalProps } from "../../types/authTypes";
import { ModalPortal } from "../../../../shared/components/ModalPortal/ModalPortal";
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
}: AuthModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalPortal isOpen={isOpen}>
      <ModalOverlay>
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
    </ModalPortal>
  );
};
