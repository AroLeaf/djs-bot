import { Command } from '../commands';
import { Event } from '../events';
import { EventKey } from '../types';
import { ModuleHookOptions, ModuleOptions } from '../types';

export default class Module {
  events: Event<EventKey>[];
  commands: Command[];
  hooks: ModuleHookOptions<EventKey>[];
  
  constructor(options: ModuleOptions) {
    this.events = <Event<EventKey>[]>options.events?.flat(<1>Infinity) || [];
    this.commands = <Command[]>options.commands?.flat(<1>Infinity) || [];
    this.hooks = <ModuleHookOptions<EventKey>[]>options.hooks?.flat(<1>Infinity) || [];
  }
}