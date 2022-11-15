import { Events, Message } from 'discord.js';
import { Event } from '../event';
import XRegExp from 'xregexp';

export default new Event({ event: Events.MessageCreate }, async function (message: Message) {
  if (message.author.bot) return;
  const prefix = XRegExp(message.client.prefix 
    ? `^(<@${message.client.user!.id}>|${XRegExp.escape(message.client.prefix)})` 
    : `^<@${message.client.user!.id}>`
  ).exec(message.content)?.[0];
  if (!prefix) return;

  const [commandName, args = ''] = message.content.slice(prefix.length).split(/ +(.*)/s);
  const cmd = commandName && message.client.commands?.resolvePrefixCommand(commandName);
  if (cmd) cmd.execute(message, args);
})