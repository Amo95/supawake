#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { listCommand } from './commands/list';
import { pingCommand } from './commands/ping';
import { startCommand } from './commands/start';
import { statusCommand } from './commands/status';

const program = new Command();

program
  .name('supawake')
  .description('Keep Supabase free-tier databases awake by pinging them on a schedule.')
  .version('1.0.0');

program
  .command('add')
  .description('Interactively add a Supabase project')
  .action(async () => {
    await addCommand();
  });

program
  .command('remove <name>')
  .description('Remove a configured project by name')
  .action((name: string) => {
    removeCommand(name);
  });

program
  .command('list')
  .description('List all configured projects')
  .action(() => {
    listCommand();
  });

program
  .command('ping')
  .description('Ping all configured projects once')
  .action(async () => {
    await pingCommand();
  });

program
  .command('start')
  .description('Continuously ping projects on a cron schedule')
  .option(
    '-i, --interval <cron>',
    'cron expression (defaults to config.settings.defaultInterval, every 3 days)',
  )
  .action(async (opts: { interval?: string }) => {
    await startCommand(opts);
  });

program
  .command('status')
  .description('Check which projects are currently reachable')
  .action(async () => {
    await statusCommand();
  });

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(chalk.red(`✗ ${err.message}`));
  process.exit(1);
});
