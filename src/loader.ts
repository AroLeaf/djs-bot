import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export default class Loader {
  static async import(dir: string, allowTS = false) {
    const absolutePath = path.resolve(dir);
    const files = await <Promise<string[]>>fsPromises.readdir(absolutePath, { recursive: true })
      .then(files => files.filter(file => ['.js', '.mjs'].concat(allowTS ? ['.ts'] : []).includes(path.extname(file))));
    const modules = await Promise.all(files.map(file => import(path.join(absolutePath, file))));
    return modules.map(module => module.default).filter(m => m);
  }

  static require(dir: string, allowTS = false) {
    const absolutePath = path.resolve(dir);
    const files = (<string[]>fs.readdirSync(absolutePath, { recursive: true }))
      .filter(file => ['.js', '.cjs'].concat(allowTS ? ['.ts'] : []).includes(path.extname(file)));
    const modules = files.map(file => require(path.join(absolutePath, file)));
    return modules.map(module => module.default || module).filter(m => m);
  }
}