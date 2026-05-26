import { UserCommand } from '../../../dist';

export default new UserCommand({
  name: 'grab-avatar',
  description: 'Grabs a user\'s avatar', 
}, ({ reply }, user) => reply(user.displayAvatarURL({ extension: 'png', forceStatic: false, size: 1024 })));