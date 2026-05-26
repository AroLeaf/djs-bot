import type { ContextMenuCommandInteraction } from 'discord.js';
import { InteractionCommandContext } from '../InteractionCommandContext';

export abstract class ContextCommandContext<E extends ContextMenuCommandInteraction> extends InteractionCommandContext<E> {}