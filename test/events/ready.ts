import { Events } from 'discord.js';
import { Event } from '../../dist';

export default new Event({
    event: Events.ClientReady,
  }, () => console.log('ready!'));