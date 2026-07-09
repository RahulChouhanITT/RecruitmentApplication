import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useIsAnyMutationPending = (): boolean => {
  return useSelector((state: RootState) =>
    Object.values(state).some(
      (slice: unknown) =>
        slice &&
        typeof slice === 'object' &&
        'mutations' in slice &&
        Object.values((slice as { mutations: Record<string, unknown> }).mutations).some(
          (mutation) =>
            mutation && typeof mutation === 'object' && (mutation as { status: string }).status === 'pending',
        ),
    ),
  );
};
