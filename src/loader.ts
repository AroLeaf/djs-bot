import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export default class Loader {
  static async import(dir: string) {
    const absolutePath = path.resolve(dir);
    const files = await fsPromises.readdir(absolutePath, { recursive: true });
    const modules = await Promise.all(files.map(file => import(path.join(absolutePath, file))));
    return modules.map(module => module.default).filter(m => m);
  }

  static require(dir: string) {
    const absolutePath = path.resolve(dir);
    const files = <string[]>fs.readdirSync(absolutePath, { recursive: true });
    const modules = files.map(file => require(path.join(absolutePath, file)));
    return modules.map(module => module.default || module).filter(m => m);
  }
}