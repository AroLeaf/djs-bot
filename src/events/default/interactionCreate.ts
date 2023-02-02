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

  if (interaction.isMessageComponent()) {
    const component = interaction.client.components!.get(interaction.customId);
    if (!component) return;
    try {
      await component.run(interaction);
    } catch (error) {
      console.error(error);
      const replyData = {
        content: 'An error occurred while running this component.',
        ephemeral: true,
      }
      interaction.replied ? interaction.followUp(replyData) : interaction.deferred ? interaction.editReply(replyData) : interaction.reply(replyData);
    }
  }
})