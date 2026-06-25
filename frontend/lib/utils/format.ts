const overrides: Record<string, string> = {
  customer: "Customer Name",
  order_id: "Order ID",
  student_id: "Student ID",
  id: "ID",
  product_id: "Product ID",
  employee_id: "Employee ID",
};

export function formatColumnLabel(columnName: string | undefined | null): string {
  if (!columnName) return "";
  
  const lowerCol = columnName.toLowerCase().trim();
  
  if (overrides[lowerCol]) {
    return overrides[lowerCol];
  }

  return columnName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatErrorMessage(message: string | undefined, column: string): string {
  if (!message) return "";
  const displayCol = formatColumnLabel(column);
  // Dynamically replace the raw column name in old messages with the Display Label
  return message.replace(`'${column}'`, `'${displayCol}'`);
}
