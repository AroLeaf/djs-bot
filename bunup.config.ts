import { BunupPlugin, defineConfig } from 'bunup';
import { exports, unused } from 'bunup/plugins';
import fs from 'node:fs/promises';

const declares = /* ts */`
declare module "discord.js" {
  interface Client {
    events: EventManager;
    commands: CommandManager;
  }
}
`.slice(1);

const fixTypes: BunupPlugin = {
  name: 'fix-types',
  hooks: {
    async onBuildDone(ctx) {
      for (const file of ctx.files) {
        if (!file.dts) continue;
        const content = await fs.readFile(file.fullPath, 'utf-8');
        const fixed = declares + content
          .replace(/^import(.*)from "discord"/gm, 'import$1from "discord.js"')
          .replace(/^\s*private;/gm, '');
        await fs.writeFile(file.fullPath, fixed, 'utf-8');
      }
    },
  }
}

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  plugins: [
    exports(),
    unused(),
    fixTypes,
  ],
});