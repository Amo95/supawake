import chalk from 'chalk';
import cron from 'node-cron';
import { loadConfig } from '../config';
import { pingAll } from '../ping';
import { notifyFailures } from '../notify';
import { formatResult } from './ping';

export async function startCommand(opts: { interval?: string }): Promise<void> {
  const config = loadConfig();
  const schedule = opts.interval || config.settings.defaultInterval;

  if (!cron.validate(schedule)) {
    console.error(chalk.red(`✗ Invalid cron expression: "${schedule}"`));
    process.exit(1);
  }

  if (config.projects.length === 0) {
    console.log(chalk.yellow('No projects configured. Run "supawake add" first.'));
    return;
  }

  console.log(chalk.bold(`supawake started`));
  console.log(chalk.gray(`  schedule: ${schedule}`));
  console.log(chalk.gray(`  projects: ${config.projects.length}`));
  console.log(chalk.gray(`  press Ctrl+C to stop\n`));

  const run = async () => {
    const ts = new Date().toISOString();
    console.log(chalk.bold(`[${ts}] pinging…`));
    const latest = loadConfig();
    const results = await pingAll(latest.projects);
    for (const r of results) console.log(formatResult(r));
    await notifyFailures(results, latest.settings.notifications);
    console.log('');
  };

  // Run once immediately so users get instant feedback.
  await run();

  const task = cron.schedule(schedule, run);
  task.start();

  const stop = () => {
    console.log(chalk.yellow('\nStopping…'));
    task.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
