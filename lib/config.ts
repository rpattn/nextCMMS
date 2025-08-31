export function getEnvJSON<T = any>(key: string): T | null {
  const v = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

