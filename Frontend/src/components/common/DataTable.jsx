import React from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export function DataTable({
  columns = [],
  data = [],
  keyExtractor = (row, index) => row.id || row._id || index,
  onRowClick,
  emptyState,
  loading = false,
  className = ''
}) {
  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (!data || data.length === 0) {
    return emptyState || <EmptyState title="No records found" description="There is no data to display in this table." />;
  }

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C]">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={col.width ? { width: col.width } : undefined}
                className={`py-2 px-3 text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#353535]">
          {data.map((row, rowIdx) => (
            <tr
              key={keyExtractor(row, rowIdx)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A]' : 'hover:bg-[#FAFAF9] dark:hover:bg-[#242424]'
              }`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key || colIdx}
                  className={`py-2.5 px-3 text-[#252525] dark:text-[#F2F2F2] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

