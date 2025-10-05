export function toCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers.join(",") + "\n";
  }
  const headerLine = headers.join(",");
  const lines = rows.map((row) =>
    headers
      .map((key) => {
        const value = row[key] ?? "";
        if (value === null || value === undefined) return "";
        const escaped = String(value).replace(/"/g, '""');
        if (/[",\n]/.test(escaped)) {
          return `"${escaped}` + `"`;
        }
        return escaped;
      })
      .join(",")
  );
  return [headerLine, ...lines].join("\n");
}
