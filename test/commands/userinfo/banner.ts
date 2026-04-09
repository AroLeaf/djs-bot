import { ApplicationCommandOptionType, ImageURLOptions } from 'discord.js';
import { SubCommand } from '../../../dist';

import parent from '.';

const subCommand = new SubCommand(parent, {
  name: 'banner',
  description: 'grab a user\'s banner image',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'the user you want the banner image of. Leave blank to grab your own',
  }],
}, ({ reply, user: author, guild }, { user = author }) => {
  const imageURLOptions: ImageURLOptions = {
    extension: 'png',
    forceStatic: false,
    size: 1024,
  };
  const member = guild?.members.resolve(user);
  const url = member?.displayBannerURL(imageURLOptions) || user.bannerURL(imageURLOptions);
  return reply(url || 'This user has no banner image set, or I do not have access to it.');
});

parent.subCommand(subCommand);