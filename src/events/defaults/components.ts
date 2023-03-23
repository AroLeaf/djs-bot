import { Events } from 'discord.js';
import Event from '../event';

export default new Event({
  name: 'Components',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isMessageComponent() || !interaction.inCachedGuild()) return;

  const componentHandler = interaction.client.components.get(interaction.customId);
  if (!componentHandler) return;

  return componentHandler(interaction);
});