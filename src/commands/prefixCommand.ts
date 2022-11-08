import { Message } from 'discord.js';

import {
  BaseCommandData,
  Prefix,
  PrefixCommandArgumentData,
  PrefixCommandArguments,
  PrefixCommandData,
  PrefixCommandOptionData,
  PrefixCommandOptionType,
  PrefixCommandOptionTypeString,
  ResolvedPrefixCommandOptionType,
} from '../types.js';

import { Command } from './command.js';
import * as log from '../logging.js';
import * as Arguments from '../arguments.js';

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
  run: (message: Message, args: PrefixCommandArguments<ResolvedPrefixCommandOptionType>) => any;
  options?: PrefixCommandOptionData[];
  args?: PrefixCommandArgumentData[];

  constructor(data: BaseCommandData<PrefixCommandData>, run: (message: Message, args: PrefixCommandArguments<ResolvedPrefixCommandOptionType>) => any) {
    super(data);
    this.run = run;
    this.args = data.args;
    this.options = data.options;
  }

  async execute(message: Message, args: string) {
    if (!super.check(message)) return;

    let parsed: PrefixCommandArguments<ResolvedPrefixCommandOptionType> = args.split(/ +/);

    const transformer = async (input: string, name: string, option?: string): Promise<ResolvedPrefixCommandOptionType> => {
      const resolveType = (type: PrefixCommandOptionTypeString | PrefixCommandOptionType) => typeof type === 'string' ? PrefixCommandOptionType[type] : type;
      
      const arg = option
        ? this.options?.find(opt => opt.name === option)?.args?.find(arg => arg.name === name)!
        : this.args?.find(arg => arg.name === name)!;

      if (!input) throw new Error(`Empty argument ${arg.name}`);
      switch (resolveType(arg.type)) {
        case PrefixCommandOptionType.STRING: {
          return input;
        }
  
        case PrefixCommandOptionType.NUMBER: {
          const number = Number(input);
          if (!Number.isFinite(number)) throw new Error(`\`${input}\` is not a finite number.`);
          return number;
        }
  
        case PrefixCommandOptionType.INTEGER: {
          const int = parseInt(input);
          if (!Number.isSafeInteger(int)) throw new Error(`\`${input}\` is not a valid integer.`);
          return int;
        }
  
        case PrefixCommandOptionType.USER: {
          const match = input.match(/^(\d+)|<@!?(\d+)>$/);
          const id = match?.[1] || match?.[2];
          const user = id && await message.client.users.fetch(id).catch(()=>{});
          if (!user) throw new Error(`Failed to find user \`${id || input}\``);
          return user;
        }
  
        case PrefixCommandOptionType.MEMBER: {
          const match = input.match(/^(\d+)|<@!?(\d+)>$/);
          const id = match?.[1] || match?.[2];
          const member = id && await message.guild?.members.fetch(id).catch(()=>{});
          if (!member) throw new Error(`Failed to find member \`${id || input}\``);
          return member;
        }
  
        case PrefixCommandOptionType.USERLIKE: {
          const match = input.match(/^(\d+)|<@!?(\d+)>$/);
          const id = match?.[1] || match?.[2];
          const userlike = id && (
            await message.guild?.members.fetch(id).catch(()=>{}) ||
            await message.client.users.fetch(id).catch(()=>{})
          );
          if (!userlike) throw new Error(`Failed to find member or user \`${id || input}\``);
          return userlike;
        }
  
        case PrefixCommandOptionType.ROLE: {
          const match = input.match(/^(\d+)|<@&(\d+)>$/);
          const id = match?.[1] || match?.[2];
          const role = id && await message.guild?.roles.fetch(id).catch(()=>{});
          if (!role) throw new Error(`Failed to find role \`${id || input}\``);
          return role;
        }
  
        case PrefixCommandOptionType.CHANNEL: {
          const match = input.match(/^(\d+)|<#(\d+)>$/);
          const id = match?.[1] || match?.[2];
          const channel = id && await message.guild?.channels.fetch(id).catch(()=>{});
          if (!channel) throw new Error(`Failed to find channel \`${id || input}\``);
          return channel;
        }
        
        case PrefixCommandOptionType.MESSAGE: {
          const msg = await message.channel.messages.fetch(input).catch(()=>{});
          if (!msg) throw new Error(`Failed to find message \`${input}\``);
          return msg;
        }
      }
    }

    if (this.options || this.args) {      
      parsed = await Arguments.parse<ResolvedPrefixCommandOptionType>(args, {
        args: this.args,
        options: this.options,
        transformer,
      });
    }

    try {
      if (!await this.check(message)) return;
      await this.run(message, parsed);
      return;
    } catch (err) {
      log.error(err);
      return message.reply('Something went wrong executing the command');
    }
  }
}