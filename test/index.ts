import { Bot, IntentsBitField, Loader } from '../dist';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      TEST_GUILD: string;
    }
  }
}

const bot = new Bot({
  intents: [IntentsBitField.Flags.Guilds],
  commands: {
    commands: await Loader.load('commands'),
    register: { guilds: [ process.env.TEST_GUILD ] },
  },
  events: { events: await Loader.load('events') },
});

bot.login(process.env.DISCORD_TOKEN);