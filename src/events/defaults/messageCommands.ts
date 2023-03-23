import { Events } from 'discord.js';
import { BotHooks } from '../../types/bot';
import Event from '../event';

export default new Event({
  name: 'Message Context Commands',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isMessageContextMenuCommand() || !interaction.inCachedGuild()) return;
 
  const command = interaction.client.commands.resolveMessageCommand(interaction.commandName);
  if (!command) return;
  
  const ok = await interaction.client.events.runHooks(BotHooks.MessageCommand, interaction, command);
  if (ok === false) return;
  
  return command.run(interaction);
});