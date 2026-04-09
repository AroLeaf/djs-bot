import path from 'node:path';
import fs from 'node:fs/promises';

export class Loader {
  static async load(dir: string): Promise<any[]> {
    const files = await fs.readdir(path.resolve(dir), { recursive: true });
    const modules = await Promise.all(files.map(file => import(path.resolve(dir, file))));
    return modules.map(module => module.default).filter(Boolean);
  }
}