import { ApplicationCommandType, type GuildMember, type User, type UserContextMenuCommandInteraction } from 'discord.js';
import { type InteractionCommandOptions } from '../InteractionCommand';
import { UserCommandContext } from './UserCommandContext';
import { ContextCommand } from './ContextCommand';

export interface UserCommandOptions extends InteractionCommandOptions {};

export type UserCommandHandler = (ctx: UserCommandContext, user: User & { member?: GuildMember }) => any;

export class UserCommand extends ContextCommand {
  type: ApplicationCommandType.User = ApplicationCommandType.User;
  handler: UserCommandHandler;

  constructor(options: UserCommandOptions, handler: UserCommandHandler) {
    super(options);
    this.handler = handler;
  }

  async run(interaction: UserContextMenuCommandInteraction<'cached'>): Promise<any> {
    const ctx = new UserCommandContext(this, interaction);

    try {
      if (!await this.checkHooks(ctx)) return;
      await this.handler(ctx, Object.assign(interaction.targetUser, { member: interaction.targetMember }));
    } catch (err) {
      console.log(err);
    }
  }
}