import { recursive, require as _require } from 'file-ez';
import { resolve } from 'path';


/**
 * Partitions an array into two arrays, one with the elements that satisfy the predicate, and one with the elements that do not.
 * @param array - the array to partition
 * @param pred - the predicate to test each element with
 * @param that - the value of `this` in the predicate
 * @returns an array containing the two partitions
 */
export function partition<T>(array: T[], pred: (value: T, index: number, arr: T[]) => boolean, that?: any): [T[], T[]] {
  if (that) pred = pred.bind(that);
  const yes: T[] = [], no: T[] = [];
  for (let i = 0; i < array.length; i++) {
    if (pred(array[i]!, i, array)) yes.push(array[i]!); 
    else no.push(array[i]!);
  }
  return [yes, no];
}


/**
 * Returns a new object with the specified keys omitted, like typescript's `Omit`, but it actually changes the object.
 * @param object - the object to omit keys from
 * @param omit - the keys to omit
 * @returns A new object with the specified keys omitted.
 */
export function objectOmit<T extends object, O extends keyof T>(object: T, ...omit: O[]): Omit<T, O> {
  const copy = { ...object };
  for (const key of omit) delete copy[key];
  return copy;
}


/**
 * Returns a new object with only the specified keys, like typescript's `Pick`, but it actually changes the object.
 * @param object - the object to pick keys from
 * @param pick - the keys to pick
 * @returns A new object with only the specified keys.
 */
export function objectPick<T extends object, P extends keyof T>(object: T, ...pick: P[]): Pick<T, P> {
  const copy = { ...object };
  for (const key of <P[]>Object.keys(copy)) if (!pick.includes(key)) delete copy[key];
  return copy;
}


/**
 * Recursively loads all default exports from a directory and its subdirectories.
 * @param dir - the directory to load from
 * @returns an array of all the default exports
 */
export async function loader(dir: string) {
  const files = await recursive(resolve(dir));
  const modules = await Promise.all(files.map(file => _require(file)));
  return modules.filter(m => m);
}