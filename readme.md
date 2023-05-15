# DJS-Bot

A bot library / wrapper around [discord.js][djs]. This was made for personal use, so you may not get the kind of support you would get from many other packages.

[Documentation][docs]

## Install

You can install DJS-Bot from NPM:

```sh
npm i @aroleaf/djs-bot
```

## Example

```js
import { Bot, GatewayIntentBits, importRecursive } from '@aroleaf/djs-bot';

const bot = new Bot({
  intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ],
  commands: await importRecursive('commands'),
  events: await importRecursive('events'),
  owner: '123456789012345678',
  prefix: '!',
});

bot.login('token');
```

[djs]: https://discord.js.org/
[docs]: https://djs-bot.leaf.moe/