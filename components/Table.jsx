export default function Table({
  columns = [],
  data = [],
  emptyMessage = "Nothing to display",
  mobileCardView = true,
}) {
  // Mobile card view for better mobile experience
  if (mobileCardView) {
    return (
      <div className="space-y-4">
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-500">{emptyMessage}</div>
            </div>
          ) : (
            data.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3"
              >
                {columns.map((column) => {
                  const cellContent = column.cell
                    ? column.cell(row)
                    : row[column.accessor];
                  return (
                    <div
                      key={column.accessor}
                      className="flex justify-between items-start"
                    >
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {column.header}
                      </span>
                      <div className="text-sm text-slate-900 text-right flex-1 ml-4">
                        {cellContent}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={columns.length}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-4 py-4 text-sm text-slate-700"
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Original table view for cases where card view is disabled
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-6 text-center text-sm text-slate-500"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {columns.map((column) => (
                <td
                  key={column.accessor}
                  className="px-4 py-4 text-sm text-slate-700"
                >
                  {column.cell ? column.cell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
