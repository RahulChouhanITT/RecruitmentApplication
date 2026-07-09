import { useIsAnyMutationPending } from '../../../app/hooks/useIsAnyMutationPending';
import { OverlayContainer } from './GlobalLoaderOverlay.styles';

export const GlobalLoaderOverlay = () => {
  const isPending = useIsAnyMutationPending();

  if (!isPending) {
    return null;
  }

  return (
    <OverlayContainer aria-hidden="true" />
  );
};
