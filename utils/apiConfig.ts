export const getApiBase = (): string => {
  if (typeof window !== "undefined" && (window as any).__BUILDMITRA_API_BASE__) {
    return (window as any).__BUILDMITRA_API_BASE__;
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:5000"
  );
};

export const API_BASE = getApiBase();
