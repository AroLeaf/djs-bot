import { CommandOptions, CommandHooks, CommandContext, CommandHookArguments } from '../types/command';

export default abstract class Command {
  name: string;
  hooks?: CommandHooks<CommandContext>;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.hooks = options.hooks;
  }

  async before<C extends CommandContext>(...args: CommandHookArguments<C>['before']) {
    if (!this.hooks?.before) return true;
    try {
      for (const hook of this.hooks.before) {
        const result = await hook(...args);
        if (result === false) return false;
      }
      return true;
    } catch(error) {
      await this.error(...args, error as Error);
      return false;
    }
  }

  async after<C extends CommandContext>(...args: CommandHookArguments<C>['after']) {
    if (!this.hooks?.after) return;
    try {
      for (const hook of this.hooks.after) {
        await hook(...args);
      }
    } catch(error) {
      await this.error(...args, error as Error);
    }
  }

  async error<C extends CommandContext>(...args: CommandHookArguments<C>['error']) {
    if (!this.hooks?.error) return;
    for (const hook of this.hooks.error) {
      await hook(...args);
    }
  }
}