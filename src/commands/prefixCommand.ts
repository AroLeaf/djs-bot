import { Collection, GuildChannel, GuildMember, Message, Role, User } from 'discord.js';

import { Command, BaseCommandData } from './command.js';
import * as log from '../logging.js';

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


export enum PrefixCommandOptionType {
  STRING,
  NUMBER,
  INTEGER,
  USER,
  MEMBER,
  USERLIKE,
  ROLE,
  CHANNEL,
  MESSAGE,
}

export type PrefixCommandOptionTypeString = 
  | 'STRING'
  | 'NUMBER'
  | 'INTEGER'
  | 'USER'
  | 'MEMBER'
  | 'USERLIKE'
  | 'ROLE'
  | 'CHANNEL'
  | 'MESSAGE'

export interface PrefixCommandOptionData {
  type: PrefixCommandOptionType | PrefixCommandOptionTypeString;
  name: string;
  description?: string;
  strict: boolean;
  required: boolean;
}

export interface PrefixCommandData {
  name: string;
  description?: string;
  options?: PrefixCommandOptionData[];
}

export type PrefixCommandOptionOptions = {
  type?: PrefixCommandOptionType | PrefixCommandOptionTypeString;
  name: string;
  description?: string;
  strict?: boolean;
  required?: boolean;
} | string;


export type ResolvedPrefixCommandOptionType = 
| string
| number
| User
| GuildMember
| Role
| GuildChannel
| Message

export type PrefixCommandArguments<Parsed = boolean> = Parsed extends true ? Collection<string, ResolvedPrefixCommandOptionType> & { raw: string[] } : string[];

export class PrefixCommand extends Command {
  run: (message: Message, args: PrefixCommandArguments) => any;
  options?: PrefixCommandOptionData[];

  constructor(data: BaseCommandData<PrefixCommandData>, run: (message: Message, args: PrefixCommandArguments) => any) {
    super(data);
    this.run = run;
    this.options = data.options;
  }

  async execute(message: Message, args: string[]) {
    const resolveType = (type: PrefixCommandOptionTypeString | PrefixCommandOptionType) => typeof type === 'string' ? ({
      STRING: 0,
      NUMBER: 1,
      INTEGER: 2,
      USER: 3,
      MEMBER: 4,
      USERLIKE: 5,
      ROLE: 6,
      CHANNEL: 7,
      MESSAGE: 8,
    })[type] : type;


    let parsed: PrefixCommandArguments = args;

    if (this.options) {
      parsed = Object.assign(new Collection<string, ResolvedPrefixCommandOptionType>(), { raw: args });

      for (const arg of this.options) {
        const input = args[parsed.size];

        const value = await (async () => {
          if (!input) return;
          switch (resolveType(arg.type)) {
            case 0: {
              return input;
            }

            case 1: {
              const number = Number(input);
              return Number.isFinite(number) && number;
            }

            case 2: {
              const int = parseInt(input);
              return Number.isSafeInteger(int) && int;
            }

            case 3: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.client.users.fetch(id).catch(()=>{});
            }

            case 4: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.members.fetch(id).catch(()=>{});
            }

            case 5: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && (
                await message.guild?.members.fetch(id).catch(()=>{}) ||
                await message.client.users.fetch(id).catch(()=>{})
              );
            }

            case 6: {
              const match = input.match(/^(\d+)|<@&(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.roles.fetch(id).catch(()=>{});
            }

            case 7: {
              const match = input.match(/^(\d+)|<#(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.channels.fetch(id).catch(()=>{});
            }
            
            case 8: {
              return await message.channel.messages.fetch(input).catch(()=>{});
            }
          }
        })();

        if (!value || value === 0) {
          if (input && (arg.strict || arg.required)) return message.reply(`Invalid argument ${arg.name}`);
          if (arg.required) return message.reply(`Missing argument ${arg.name}`);
          continue;
        }
        parsed.set(arg.name, value);
      }
    }


    try {
      await this.run(message, parsed);
    } catch (err) {
      log.error(err);
      message.reply('Something went wrong executing the command');
    }

    return;
  }

  static options(options: PrefixCommandOptionOptions | PrefixCommandOptionOptions[]): PrefixCommandOptionData[] {
    if (Array.isArray(options)) return options.map(opt => PrefixCommand.options(opt)[0] as PrefixCommandOptionData);
    if (typeof options === 'string') return PrefixCommand.options({ name: options.toLowerCase() });
    return [{
      name: options.name,
      description: options.description,
      type: options.type ?? 'STRING',
      required: options.required ?? false,
      strict: options.strict ?? true,
    }];
  }
}