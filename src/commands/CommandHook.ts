import type { GuildTextBasedChannel, PermissionResolvable } from 'discord.js';
import type { CommandContext } from './CommandContext';

export interface CommandHook<C extends CommandContext = CommandContext> {
  (ctx: C): Promise<boolean | void> | boolean | void;
}


// TODO: move these to their own file(s) and rename
export const BuiltinCommandHooks = {
  // TODO: make this not shit
  permissions(perms: PermissionResolvable, allowDMs = false): CommandHook {
    return async ({ reply, member, channel }) => {
      if (!member && ! allowDMs) {
        await reply('This command may only be used in a server.');
        return false;
      }
      
      if (!member.permissionsIn(<GuildTextBasedChannel>channel).has(perms)) {
        await reply('This command requires permissions you do not have.');
        return false;
      }
      
      return true;
    }
  }
}