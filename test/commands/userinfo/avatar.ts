import { ApplicationCommandOptionType } from 'discord.js';

import parent from '.';

parent.subCommand({
  name: 'avatar',
  description: 'grab a user\'s avatar image',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'the user you want the avatar image of. Leave blank to grab your own',
  }],
}, ({ reply, user: author, guild }, { user = author }) => {
  const userLike = guild?.members.resolve(user) ?? user;
  const url = userLike.displayAvatarURL({
    extension: 'png',
    forceStatic: false,
    size: 1024,
  });
  return reply(url);
});