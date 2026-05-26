import path from 'node:path';
import fs from 'node:fs/promises';

export class Loader {
  static async load(dir: string): Promise<any[]> {
    const files = await fs.readdir(path.resolve(dir), { recursive: true, withFileTypes: true });
    const modules = await Promise.all(files.map(async file => file.isFile() ? import(path.resolve(file.parentPath, file.name)) : {}));
    return modules.map(module => module.default).filter(Boolean);
  }
}