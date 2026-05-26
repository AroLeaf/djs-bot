import { MessageCommand } from '../../../dist';

export default new MessageCommand({
  name: 'grab-author',
  description: 'grabs the author of a message',
}, ({ reply }, message) => reply(message.author.toString()))