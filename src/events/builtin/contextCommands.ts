import { Events } from 'discord.js';
import { Event } from '../Event';
import { InteractionCommand } from '../../commands';
import type { ContextCommand } from '../../commands/interactionCommands/contextCommands/ContextCommand';

export default <Event<Events.InteractionCreate>> new Event({
  event: Events.InteractionCreate,
  name: 'ContextCommands',
}, async interaction => {
  if (!interaction.isContextMenuCommand() || !interaction.inCachedGuild()) return;
  const commandId = InteractionCommand.generateId(interaction.command.type, interaction.commandName);
  const command = <ContextCommand>interaction.client.commands.resolve(commandId);
  await command.run(interaction);
});