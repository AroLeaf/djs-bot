export class Bound {
  constructor() {
    this.bind();
  }

  #getProperties(): Map<string | symbol, PropertyDescriptor> {
    const descriptors = new Map<string | symbol, PropertyDescriptor>();
    let obj: any = this;
    do {
      for (const key of Reflect.ownKeys(obj)) {
        if (!descriptors.has(key)) descriptors.set(key, Reflect.getOwnPropertyDescriptor(obj, key));
      }
    } while (obj = Reflect.getPrototypeOf(obj));
    return descriptors;
  }

  bind(): void {
    for (const [key, descriptor] of this.#getProperties()) {
      if (!descriptor.writable) continue;
      if (descriptor.get || descriptor.set) continue;
      this[key] = (<Function>descriptor.value).bind(this);
    }
  }
}