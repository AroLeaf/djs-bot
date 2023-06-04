export * from 'discord.js';
export * from './events';
export * from './commands';
export * from './types';
export * from './modules';
export * from './util';

import Bot from './bot';
import ComponentsManager from './componentsManager';
import Loader from './loader';

export { Bot, ComponentsManager, Loader };