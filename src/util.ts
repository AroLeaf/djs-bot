export function objectOmit<T extends object, O extends keyof T>(object: T, ...omit: O[]): Omit<T, O> {
  const copy = { ...object };
  for (const key of omit) delete copy[key];
  return copy;
}