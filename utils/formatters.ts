export const formatSupplierName = (name?: string, maxLength: number = 8): string => {
  if (!name || typeof name !== "string") return "Supplier";
  const trimmed = name.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
};
