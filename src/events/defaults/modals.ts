import { Events } from 'discord.js';
import { BotHooks } from '../../types';
import Event from '../event';

export default new Event({
  name: 'Modals',
  event: Events.InteractionCreate,
}, async (interaction) => {
  if (!interaction.isModalSubmit() || !interaction.inCachedGuild()) return;

  const modalReceiver = interaction.client.commands.resolveModalReceiver(interaction.customId);
  if (!modalReceiver) return;

  const ok = await interaction.client.events.runHooks(BotHooks.ModalReceiver, interaction, modalReceiver);
  if (ok === false) return;
  
  return modalReceiver.run(interaction);
});