import { ApplicationCommandOptionType, BuiltinCommandHooks, PermissionFlagsBits, SlashCommand } from '../../dist';

export default new SlashCommand({
  name: 'kick',
  description: 'kick someone',
  hooks: [BuiltinCommandHooks.permissions(PermissionFlagsBits.KickMembers)],
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'target',
    description: 'who to kick',
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'reason',
    description: 'why this user is getting kicked',
  }],
}, ({ reply }, { target, reason = 'no reason provided' }) => {
  if (!target.member) return reply(`${target} is not in this server, and can therefore not be kicked from it.`);
  
  target.member.kick(reason);
  return reply(`Kicked ${target} for: ${reason}`);
});