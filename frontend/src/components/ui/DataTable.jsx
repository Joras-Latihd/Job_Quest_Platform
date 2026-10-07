import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { cn } from '@/utils/cn';

/*
 * columns: [{ key, header, sortable?, render?(row), className? }]
 * Desktop: a normal table. Mobile: every row becomes a labelled card.
 */
export default function DataTable({ columns, rows = [], isLoading, isError, onRetry, sort, onSort, emptyTitle = 'Nothing to show yet', emptyDescription }) {
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (isLoading) {
    return (
      <div className="card space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10" />)}
      </div>
    );
  }
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const cell = (column, row) => (column.render ? column.render(row) : row[column.key] ?? '-');
  const sortIcon = (column) => {
    if (sort?.key !== column.key) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />;
    return sort.dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />;
  };

  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn('whitespace-nowrap px-4 py-3', column.className)} aria-sort={sort?.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {column.sortable ? (
                    <button type="button" onClick={() => onSort(column.key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                      {column.header}{sortIcon(column)}
                    </button>
                  ) : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50/70">
                {columns.map((column) => <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>{cell(column, row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row._id} className="card min-w-0 space-y-2 p-4 text-sm">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-4">
                <span className="shrink-0 pr-2 text-slate-500">{column.header}</span>
                <span className="min-w-0 max-w-[60%] break-words text-right">{cell(column, row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
