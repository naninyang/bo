import styles from '@/styles/All.module.sass';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number | null;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = total ? Math.ceil(total / pageSize) : null;

  return (
    <div className={styles.pagination}>
      <div className={styles.pager}>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          이전
        </button>
        {totalPages ? (
          <span>
            {page} / {totalPages}
          </span>
        ) : (
          <span aria-label="현재 페이지">{page}</span>
        )}
        <button type="button" disabled={totalPages ? page >= totalPages : false} onClick={() => onPageChange(page + 1)}>
          다음
        </button>
      </div>
      {pageSize > 0 && onPageSizeChange && (
        <div className={styles.pagesize}>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}개씩 보기
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
