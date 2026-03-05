export type AuthModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  closeLabel?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
};

export type ModalProps = AuthModalProps;
