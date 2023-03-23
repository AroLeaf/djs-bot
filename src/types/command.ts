import { Command } from '../commands';

export type CommandHookString =
  | 'before'
  | 'after'
  | 'error'

export type CommandHooks<C extends CommandContext> = {
  [key in CommandHookString]?: ((...args: CommandHookArguments<C>[key]) => any)[];
}

export interface CommandHookArguments<C extends CommandContext> {
  before: [context: C, args: any];
  after: [context: C, args: any];
  error: [context: C, args: any, error: Error];
}

export interface CommandOptions<C extends CommandContext = CommandContext> {
  name: string;
  hooks?: CommandHooks<C>;
}

export interface CommandContext {
  command: Command;
}
