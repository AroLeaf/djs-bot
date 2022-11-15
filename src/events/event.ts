import { Client } from 'discord.js';
import { EventOptions } from '../types';

export class Event {
  name?: string;
  event: string;
  repeat: boolean;
  run: Function;

  constructor(data: EventOptions, run: Function) {
    this.name = data.name;
    this.event = data.event;
    this.repeat = data.repeat ?? true;
    this.run = run;
  }

  init(client: Client) {
    this.repeat
      ? client.on(this.event, (...args) => this.run(...args))
      : client.once(this.event, (...args) => this.run(...args));
  }
}