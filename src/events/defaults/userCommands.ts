import { Events } from 'discord.js';
import { BotHooks } from '../../types/bot';
import Event from '../event';

export default new Event({
  name: 'User Context Commands',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isUserContextMenuCommand() || !interaction.inCachedGuild()) return;
 
  const command = interaction.client.commands.resolveUserCommand(interaction.commandName);
  if (!command) return;
  
  const ok = await interaction.client.events.runHooks(BotHooks.UserCommand, interaction, command);
  if (ok === false) return;
  
  return command.run(interaction);
});