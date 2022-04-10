import { Client } from 'discord.js';

export interface EventOptions {
  name?: string;
  event: string;
  repeat?: boolean;
  _default?: boolean | number;
}

export class Event {
  name?: string;
  event: string;
  repeat: boolean;
  _default?: number;
  run: Function;

  constructor(data: EventOptions, run: Function) {
    this.name = data.name;
    this.event = data.event;
    this.repeat = data.repeat ?? true;
    this._default = Number(data._default);
    this.run = run;
  }

  init(client: Client) {
    if (!this._default || this._default > client.listenerCount(this.event)) {
      this.repeat
        ? client.on(this.event, (...args) => this.run(...args))
        : client.once(this.event, (...args) => this.run(...args));
    }
  }
}