import { ApplicationCommandType, Events } from 'discord.js';
import { Event } from '../Event';
import { InteractionCommand, type SlashCommand } from '../../commands';

export default <Event<Events.InteractionCreate>> new Event({
  event: Events.InteractionCreate,
  name: 'SlashCommands',
}, async interaction => {
  if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
  const commandId = InteractionCommand.generateId(ApplicationCommandType.ChatInput, interaction.commandName);
  const command = <SlashCommand>interaction.client.commands.resolve(commandId);
  await command.run(interaction);
});