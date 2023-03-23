import { Events } from 'discord.js';
import { BotHooks } from '../../types';
import Event from '../event';

export default new Event({
  name: 'Prefix Commands',
  event: Events.MessageCreate,
}, async (message) => {
  const prefix = await message.client.prefix?.get(message);
  if (!prefix) return;

  const [ commandName, args = '' ] = message.content.slice(prefix.length).split(/ +(.*)/);
  const command = message.client.commands.resolvePrefixCommand(commandName);
  if (!command) return;

  const ok = await message.client.events.runHooks(BotHooks.PrefixCommand, message, command);
  if (ok === false) return;

  return command.run(message, args);
});