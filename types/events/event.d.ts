import { Client } from 'discord.js';
export interface EventOptions {
    name?: string;
    event: string;
    repeat?: boolean;
    _default?: boolean | number;
}
export declare class Event {
    name?: string;
    event: string;
    repeat: boolean;
    _default?: number;
    run: Function;
    constructor(data: EventOptions, run: Function);
    init(client: Client): void;
}
