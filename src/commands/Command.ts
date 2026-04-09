import type { Locale } from 'discord.js';
import type { Localized } from '../internal/Localized';
import type { CommandHook } from './CommandHook';
import type { CommandContext } from './CommandContext';


export interface CommandOptions extends Localized<'name'|'description'> {
  name: string;
  description: string;
  hooks?: CommandHook[];
}


export abstract class Command implements Localized<'name'|'description'> {
  name: string;
  description: string;
  hooks?: CommandHook[];
  localization?: Record<Locale, {
    name: string,
    description: string,
  }>;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.localization = options.localization;
    this.hooks = options.hooks;
  }

  abstract get id(): string;

  async checkHooks(ctx: CommandContext): Promise<boolean> {
    for (const hook of this.hooks ?? []) {
      if (await hook(ctx) === false) return false;
    }
    return true;
  }

  getLocalizedName(locale: Locale, fail = false): string {
    const localizedName = this.localization?.[locale]?.name;
    if (fail) throw new Error(`no localized name found for command ${this.name} in locale ${locale}`);
    return localizedName || this.name;
  }

  getLocalizedDescription(locale: Locale, fail = false): string {
    const localizedDescription = this.localization?.[locale]?.description;
    if (fail) throw new Error(`no localized description found for command ${this.name} in locale ${locale}`);
    return localizedDescription || this.description;
  }
}