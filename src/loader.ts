import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export default class Loader {
  static async import(dir: string) {
    const absolutePath = path.resolve(dir);
    const files = await fsPromises.readdir(absolutePath, { recursive: true, withFileTypes: true })
      .then(files => files.filter(file => file.isFile()).map(file => file.name));
    const modules = await Promise.all(files.map(file => import(path.join(absolutePath, file))));
    return modules.map(module => module.default).filter(m => m);
  }

  static require(dir: string) {
    const absolutePath = path.resolve(dir);
    const files = fs.readdirSync(absolutePath, { recursive: true, withFileTypes: true }).filter(file => file.isFile()).map(file => file.name);
    const modules = files.map(file => require(path.join(absolutePath, file)));
    return modules.map(module => module.default || module).filter(m => m);
  }
}