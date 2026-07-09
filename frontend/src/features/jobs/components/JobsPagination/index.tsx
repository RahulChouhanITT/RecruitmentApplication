import { Button } from '../../../../shared/ui/Button';
import type { ApiPagination } from '../../../../types/apiTypes';
import { PaginationActions, PaginationBar, PaginationMeta } from './JobsPagination.styles';

type JobsPaginationProps = {
  pagination?: ApiPagination;
  page: number;
  onPageChange: (page: number) => void;
};

export const JobsPagination = ({ pagination, page, onPageChange }: JobsPaginationProps) => {
  if (!pagination) {
    return null;
  }

  return (
    <PaginationBar>
      <PaginationMeta>
        Page {pagination.page} of {pagination.totalPages} • {pagination.total} items
      </PaginationMeta>
      <PaginationActions>
        <Button
          type="button"
          $variant="ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          disabled={page >= pagination.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </PaginationActions>
    </PaginationBar>
  );
};
