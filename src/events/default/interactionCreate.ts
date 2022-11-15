import { AutocompleteInteraction, Events, Interaction } from 'discord.js';
import { Event } from '../event';

export default new Event({ event: Events.InteractionCreate }, async function (interaction: Interaction<'cached'>) {
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.client.commands?.resolveSlashCommand(interaction.commandName);

    return cmd && cmd.execute(interaction);
  }

  if (interaction.isUserContextMenuCommand()) {
    const cmd = interaction.client.commands?.resolveUserCommand(interaction.commandName);
    return cmd && cmd.execute(interaction);
  }

  if (interaction.isMessageContextMenuCommand()) {
    const cmd = interaction.client.commands?.resolveMessageCommand(interaction.commandName);
    return cmd && cmd.execute(interaction);
  }

  if (interaction.isModalSubmit()) {
    const cmd = interaction.client.commands?.resolveModalHandler(interaction.customId);        
    return cmd && cmd.execute(interaction);
  }

  if (interaction.isAutocomplete()) {
    const cmd = interaction.client.commands?.resolveSlashCommand(interaction.commandName);        
    return cmd && cmd.autocomplete(<AutocompleteInteraction<'cached'>>interaction);
  }
})