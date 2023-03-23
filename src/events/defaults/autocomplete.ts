import { Events } from 'discord.js';
import Event from '../event';

export default new Event({
  name: 'Autocomplete',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isAutocomplete() || !interaction.inCachedGuild()) return;

  const command = interaction.client.commands.resolveSlashCommand(interaction.commandName);
  if (!command) return;
  
  return command.autocomplete(interaction);
});