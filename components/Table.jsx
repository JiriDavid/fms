export default function Table({
  columns = [],
  data = [],
  emptyMessage = "Nothing to display",
}) {
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
