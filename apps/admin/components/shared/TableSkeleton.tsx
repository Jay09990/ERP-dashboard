/** Keeps table loading states aligned with the shared admin table layout. */
export function TableSkeleton({
  columns,
  rows = 5,
}: { columns: number; rows?: number }) {
  const columnKeys = Array.from(
    { length: columns },
    (_, index) => `column-${index}`,
  );
  const rowKeys = Array.from({ length: rows }, (_, index) => `row-${index}`);

  return (
    <div
      className="altrex-table-wrap"
      aria-label="Loading records"
      aria-busy="true"
    >
      <table className="altrex-table">
        <thead>
          <tr>
            {columnKeys.map((key) => (
              <th key={key}>
                <span className="altrex-skeleton altrex-skeleton-heading" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((rowKey) => (
            <tr key={rowKey}>
              {columnKeys.map((columnKey) => (
                <td key={`${rowKey}-${columnKey}`}>
                  <span className="altrex-skeleton" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading records</span>
    </div>
  );
}
