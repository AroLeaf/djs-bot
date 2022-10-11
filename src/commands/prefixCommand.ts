import {
  Collection,
  Message,
} from 'discord.js';

import {
  BaseCommandData,
  Prefix,
  PrefixCommandArguments,
  PrefixCommandData,
  PrefixCommandOptionData,
  PrefixCommandOptionType,
  PrefixCommandOptionTypeString,
  ResolvedPrefixCommandOptionType,
} from '../types.js';

import { Command } from './command.js';
import * as log from '../logging.js';

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
  run: (message: Message, args: PrefixCommandArguments) => any;
  options?: PrefixCommandOptionData[];

  constructor(data: BaseCommandData<PrefixCommandData>, run: (message: Message, args: PrefixCommandArguments) => any) {
    super(data);
    this.run = run;
    this.options = data.options?.map(option => ({
      required: false,
      strict: true,
      ...option,
    }));
  }

  async execute(message: Message, args: string[]) {
    if (!super.check(message)) return;

    const resolveType = (type: PrefixCommandOptionTypeString | PrefixCommandOptionType) => typeof type === 'string' ? ({
      STRING:   PrefixCommandOptionType.STRING,
      NUMBER:   PrefixCommandOptionType.NUMBER,
      INTEGER:  PrefixCommandOptionType.INTEGER,
      USER:     PrefixCommandOptionType.USER,
      MEMBER:   PrefixCommandOptionType.MEMBER,
      USERLIKE: PrefixCommandOptionType.USERLIKE,
      ROLE:     PrefixCommandOptionType.ROLE,
      CHANNEL:  PrefixCommandOptionType.CHANNEL,
      MESSAGE:  PrefixCommandOptionType.MESSAGE,
    })[type] : type;


    let parsed: PrefixCommandArguments = args;

    if (this.options) {
      parsed = Object.assign(new Collection<string, ResolvedPrefixCommandOptionType>(), { raw: args });

      for (const arg of this.options) {
        const input = args[parsed.size];

        const value = await (async () => {
          if (!input) return;
          switch (resolveType(arg.type)) {
            case PrefixCommandOptionType.STRING: {
              return input;
            }

            case PrefixCommandOptionType.NUMBER: {
              const number = Number(input);
              return Number.isFinite(number) && number;
            }

            case PrefixCommandOptionType.INTEGER: {
              const int = parseInt(input);
              return Number.isSafeInteger(int) && int;
            }

            case PrefixCommandOptionType.USER: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.client.users.fetch(id).catch(()=>{});
            }

            case PrefixCommandOptionType.MEMBER: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.members.fetch(id).catch(()=>{});
            }

            case PrefixCommandOptionType.USERLIKE: {
              const match = input.match(/^(\d+)|<@!?(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && (
                await message.guild?.members.fetch(id).catch(()=>{}) ||
                await message.client.users.fetch(id).catch(()=>{})
              );
            }

            case PrefixCommandOptionType.ROLE: {
              const match = input.match(/^(\d+)|<@&(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.roles.fetch(id).catch(()=>{});
            }

            case PrefixCommandOptionType.CHANNEL: {
              const match = input.match(/^(\d+)|<#(\d+)>$/);
              const id = match?.[1] || match?.[2];
              return id && await message.guild?.channels.fetch(id).catch(()=>{});
            }
            
            case PrefixCommandOptionType.MESSAGE: {
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
      if (!await this.check(message)) return;
      await this.run(message, parsed);
    } catch (err) {
      log.error(err);
      message.reply('Something went wrong executing the command');
    }

    return;
  }
}