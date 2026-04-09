import type { Locale } from 'discord.js';

export interface Localized<K extends string> {
  localization?: Record<Locale, { [key in K]: string }>;
}