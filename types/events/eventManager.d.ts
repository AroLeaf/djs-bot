import { Client } from 'discord.js';
import { Event } from './event.js';
export declare class EventManager {
    client: Client;
    cache: Event[];
    constructor(client: Client, events?: Event[]);
}
