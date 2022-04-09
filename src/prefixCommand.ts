import { Message } from 'discord.js';
import { Command, PrefixCommandData, WithFlags } from './command.js';


export interface Prefix {
  get(message: Message): string | undefined;
  test(message: Message): boolean;
  mention: boolean;
}

export function stringPrefix(prefix: string, mention = true): Prefix {
  return {
    get: () => prefix,
    test: (msg: Message) => msg.content.startsWith(prefix),
    mention,
  }
}

export function regexPrefix(prefix: RegExp, mention = true): Prefix {
  return {
    get: () => prefix.source,
    test: (msg: Message) => prefix.test(msg.content),
    mention,
  }
}


export class PrefixCommand extends Command {
  run: (message: Message) => any;

  constructor(data: WithFlags<PrefixCommandData>, run: (message: Message) => any) {
    super(data);
    this.run = run;
  }
}