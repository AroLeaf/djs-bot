#!/usr/bin/env node
import { program } from 'commander';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import { ShardingManager } from 'discord.js';
import 'dotenv/config';

import * as log from './logging.js';
import { Command } from './command.js';
import { ModalHandler, Subcommand } from './appCommand.js';
log.config.level = 3;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID?: string;
      GUILD_ID?: string;
      TOKEN?: string;
    }
  }
}



program
  .command('register')
  .description('register commands with discord')
  .option('-g, --global', 'if the commands should be registered globally')
  .option('-c, --clear', 'if the command list should be cleared')
  .option('--token <token>', 'your bot token', process.env.TOKEN)
  .option('--client-id <client>', 'your bot\'s client id', process.env.CLIENT_ID)
  .option('--guild-id <guild>', 'the guild you want to register commands on', process.env.GUILD_ID)
  .argument('[export]', 'the export name of the commands, if a named export', 'default')
  .action(async (name: string, opts: { global: boolean, clear: boolean, logLevel: string, token?: string, clientId?: string, guildId?: string }) => {
    const pkg = await readFile(resolve('package.json'), 'utf8').then(pkg => JSON.parse(pkg)).catch(() => {});
    if (!pkg) error('No package.json found');
    if (!pkg.commands) error('No entry point found');
    const path = resolve(pkg.commands);
    
    const commands = opts.clear ? [] : (await import(path))[name].filter((cmd: Command) => !(cmd instanceof ModalHandler || cmd instanceof Subcommand)).map((cmd: Command) => cmd.data);

    if (!opts.token) error('No token provided');
    if (!opts.clientId) error('No clientID provided');
    if (!opts.guildId && !global) error('No guild ID provided');
    
    const res = await fetch(`https://discord.com/api/v9/applications/${opts.clientId}/${opts.global?'':`guilds/${opts.guildId}/`}commands`, {
      method: 'PUT',
      body: JSON.stringify(commands),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${opts.token}`,
      }
    });
    
    const data = await res.json() as any;
    if (res.ok) {
      log.info('successfully registered ' + data.length + ' commands');
    } else {
      log.error(JSON.stringify(data, null, 2));
    }
  });



program
  .command('start')
  .option('-r, --auto-restart', 'if the bot should automatically restart after a crash', true)
  .option('--token <token>', 'your bot token', process.env.TOKEN)
  .action(async (opts: { autoRestart: boolean, logLevel: string, token?: string }) => {
    const pkg = await readFile(resolve('package.json'), 'utf8').then(pkg => JSON.parse(pkg)).catch(() => {});
    if (!pkg) error('No package.json found');
    if (!(pkg.exports || pkg.main)) error('No entry point found');
    const path = resolve(pkg.exports || pkg.main);

    if (!opts.token) error('No token provided');

    const manager = new ShardingManager(path, {
      token: opts.token,
      respawn: opts.autoRestart,
      totalShards: 1,
    });

    manager.on('shardCreate', shard => {
      shard.on('death', () => opts.autoRestart ? log.warn('Bot crashed! Restarting...') : log.error('Bot crashed! To automatically restart set the --auto-restart flag'));
      shard.on('ready', () => log.info('Bot started successfully'));
    });

    manager.spawn();
  });



program.parseAsync();



function error(err: string) {
  log.error(err);
  program.help();
}