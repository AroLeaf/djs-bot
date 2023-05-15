import fs from 'fs/promises';
import path from 'path';

export function objectOmit<T extends object, O extends keyof T>(object: T, ...omit: O[]): Omit<T, O> {
  const copy = { ...object };
  for (const key of omit) delete copy[key];
  return copy;
}

export async function importRecursive<T>(dir: string): Promise<T[]> {
  return (async function recurse(dir: string, modules: T[] = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) await recurse(path.join(dir, file.name));
      else if (file.isFile() && /.[mc]js?/.test(file.name)) {
        const module = await import(path.join(dir, file.name));
        modules.push(module.default);
      }
    }
    return modules;
  })(path.resolve(dir));
}