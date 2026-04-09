import { ApplicationCommandOptionType, BuiltinCommandHooks, PermissionFlagsBits, SlashCommand } from '../../dist';

export default new SlashCommand({
  name: 'ban',
  description: 'ban someone',
  hooks: [BuiltinCommandHooks.permissions(PermissionFlagsBits.BanMembers)],
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'target',
    description: 'who to ban',
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'reason',
    description: 'why this user is getting banned',
  }],
}, ({ reply, guild }, { target, reason = 'no reason provided' }) => {
  guild.members.ban(target, { reason });
  return reply(`Banned ${target} for: ${reason}`);
});