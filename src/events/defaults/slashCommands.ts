import { Events } from 'discord.js';
import { SlashCommand } from '../../commands';
import { BotHooks } from '../../types/bot';
import Event from '../event';

export default new Event({
  name: 'Slash Commands',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
 
  const command = interaction.client.commands.resolveSlashCommand(interaction.commandName) as SlashCommand;
  if (!command) return;
  
  const ok = await interaction.client.events.runHooks(BotHooks.SlashCommand, interaction, command);
  if (ok === false) return;
  
  return command.run(interaction);
});