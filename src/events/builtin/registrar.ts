import { Events } from 'discord.js';
import { Event } from '../Event';

export default <Event<Events.ClientReady>> new Event({
  event: Events.ClientReady,
  name: 'CommandRegistrar',
  once: true,
}, async client => {
  await client.commands.registrar.sync();
});