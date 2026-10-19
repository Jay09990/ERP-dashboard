export function LoadingState({ message }: { message: string }) {
  return (
    <output className="altrex-table-state" aria-live="polite" aria-busy="true">
      <span className="altrex-spinner" aria-hidden="true" />
      <span>{message}</span>
    </output>
  );
}

export function TableSkeleton({
  columns,
  rows = 5,
  message,
}: {
  columns: number;
  rows?: number;
  message: string;
}) {
  const columnIndexes = Array.from({ length: columns }, (_, index) => index);
  const rowIndexes = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className="altrex-table-wrap altrex-loading-table" aria-busy="true">
      <output
        className="altrex-loading-message"
        aria-live="polite"
        aria-busy="true"
      >
        {message}
      </output>
      <table className="altrex-table" aria-hidden="true">
        <thead>
          <tr>
            {columnIndexes.map((column) => (
              <th key={column}>
                <span className="altrex-skeleton altrex-skeleton-heading" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIndexes.map((row) => (
            <tr key={row}>
              {columnIndexes.map((column) => (
                <td key={`${row}-${column}`}>
                  <span className="altrex-skeleton" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
