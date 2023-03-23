import * as Arguments from '@aroleaf/arguments';
import { Message } from 'discord.js';
import XRegExp from 'xregexp';
import { CommandOptions, PrefixCommandArgumentOptions, PrefixCommandArgumentType, PrefixCommandContext, PrefixCommandHandler, PrefixCommandOptionOptions, PrefixCommandOptions } from '../types';
import Command from './command';

export default class PrefixCommand extends Command {
  options?: PrefixCommandOptionOptions[];
  args?: PrefixCommandArgumentOptions[];
  handler: PrefixCommandHandler;

  constructor(options: PrefixCommandOptions, handler: PrefixCommandHandler) {
    super(options as CommandOptions);
    this.options = options.options;
    this.args = options.args;
    this.handler = handler;
  }

  async run(message: Message, args: string) {
    const parserArgs = (args: PrefixCommandArgumentOptions[], option?: PrefixCommandOptionOptions): Arguments.ArgumentParserArgumentData<any>[] => args.map(arg => ({
      name: arg.name,
      required: arg.required,
      transform: arg.transform && <Arguments.TransformFunction<any>>((value) => {
        const context = {
          message,
          argument: arg,
          option,
        }
        return arg.transform!(value, context);
      }),
    }));

    const parserOptions = (options: PrefixCommandOptionOptions[]): Arguments.ArgumentParserOptionData<any>[] => options.map(option => ({
      name: option.name,
      short: option.short,
      required: option.required,
      args: option.args && parserArgs(option.args, option),
      transform: option.transform && <Arguments.TransformFunction<any>>((value, a, b) => {
        const argument = a !== null ? option.args?.find(arg => arg.name === a.name) : undefined;
        const context = {
          message,
          argument: b !== null ? argument : undefined,
          option: b !== null ? option : argument,
        }
        return option.transform!(value, context);
      }),
    }));

    const transformer = <Arguments.TransformFunction<any>>(async (value, a, b) => {
      const option = this.options?.find(o => o.name === (b !== null ? b : a).name);
      const arg = a !== null ? (option || this).args?.find(arg => arg.name === a.name) : undefined;
      
      if (!arg) return value;
      if (!value) throw new Error(`Empty argument ${arg.name}`);

      const getId = (prefix: string) => {
        const regex = XRegExp(`^(?:(\\d+)|(<${prefix}\\d+>))$`);
        const match = value.match(regex);
        return match?.[1] || match?.[2];
      }

      switch (arg.type) {
        case PrefixCommandArgumentType.String: {
          return value;
        }
  
        case PrefixCommandArgumentType.Number: {
          const number = Number(value);
          if (!Number.isFinite(number)) throw new Error(`\`${value}\` is not a finite number.`);
          return number;
        }
  
        case PrefixCommandArgumentType.Integer: {
          const int = parseInt(value);
          if (!Number.isSafeInteger(int)) throw new Error(`\`${value}\` is not a valid integer.`);
          return int;
        }
  
        case PrefixCommandArgumentType.User: {
          const id = getId('@!?');
          const user = id && await message.client.users.fetch(id).catch(()=>{});
          if (!user) throw new Error(`Failed to find user \`${id || value}\``);
          return user;
        }
  
        case PrefixCommandArgumentType.Member: {
          const id = getId('@!?');
          const member = id && await message.guild?.members.fetch(id).catch(()=>{});
          if (!member) throw new Error(`Failed to find member \`${id || value}\``);
          return member;
        }
  
        case PrefixCommandArgumentType.Userlike: {
          const id = getId('@!?');
          const userlike = id && (
            await message.guild?.members.fetch(id).catch(()=>{}) ||
            await message.client.users.fetch(id).catch(()=>{})
          );
          if (!userlike) throw new Error(`Failed to find member or user \`${id || value}\``);
          return userlike;
        }
  
        case PrefixCommandArgumentType.Role: {
          const id = getId('@&');
          const role = id && await message.guild?.roles.fetch(id).catch(()=>{});
          if (!role) throw new Error(`Failed to find role \`${id || value}\``);
          return role;
        }
  
        case PrefixCommandArgumentType.Channel: {
          const id = getId('#');
          const channel = id && await message.guild?.channels.fetch(id).catch(()=>{});
          if (!channel) throw new Error(`Failed to find channel \`${id || value}\``);
          return channel;
        }
        
        case PrefixCommandArgumentType.Message: {
          const msg = await message.channel.messages.fetch(value).catch(()=>{});
          if (!msg) throw new Error(`Failed to find message \`${value}\``);
          return msg;
        }

        default: {
          throw new Error(`Unknown argument type ${arg.type}`);
        }
      }
    });

    const parsed = Object.assign((this.options || this.args) ? Arguments.parse(args, {
      args: this.args && parserArgs(this.args),
      options: this.options && parserOptions(this.options),
      transform: transformer,
    }) : args.split(/ +/), { raw: args });

    const context: PrefixCommandContext = {
      command: this,
      message,
    }

    const ok = await this.before(context, parsed);
    if (!ok) return;

    try {  
      await this.handler(context, parsed);
    } catch (error) {
      await this.error(context, parsed, error as Error);
    }

    await this.after(context, parsed);
  }
}