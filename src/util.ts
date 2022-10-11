import { recursive, require as _require } from 'file-ez';
import { resolve } from 'path';


export function partition<T>(array: T[], pred: (value: T, index: number, arr: T[]) => boolean, that?: any): [T[], T[]] {
  if (that) pred = pred.bind(that);
  const yes: T[] = [], no: T[] = [];
  for (let i = 0; i < array.length; i++) {
    if (pred(array[i]!, i, array)) yes.push(array[i]!); 
    else no.push(array[i]!);
  }
  return [yes, no];
}


export function objectOmit<T extends object, O extends keyof T>(object: T, ...omit: O[]): Omit<T, O> {
  const copy = { ...object };
  for (const key of omit) delete copy[key];
  return copy;
}

export function objectPick<T extends object, P extends keyof T>(object: T, ...pick: P[]): Pick<T, P> {
  const copy = { ...object };
  for (const key of <P[]>Object.keys(copy)) if (!pick.includes(key)) delete copy[key];
  return copy;
}


export async function loader(dir: string) {
  const files = await recursive(resolve(dir));
  const modules = await Promise.all(files.map(file => _require(file)));
  return modules.filter(m => m);
}