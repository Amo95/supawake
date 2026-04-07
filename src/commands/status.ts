import chalk from 'chalk';
import { loadConfig } from '../config';
import { pingAll } from '../ping';
import { formatResult } from './ping';

export async function statusCommand(): Promise<void> {
  const config = loadConfig();
  if (config.projects.length === 0) {
    console.log(chalk.yellow('No projects configured.'));
    return;
  }
  console.log(chalk.bold(`Checking reachability of ${config.projects.length} project(s)…\n`));
  const results = await pingAll(config.projects);
  for (const r of results) console.log(formatResult(r));

  const up = results.filter((r) => r.ok).length;
  const down = results.length - up;
  console.log('');
  console.log(
    `${chalk.green(`${up} up`)}  ${down > 0 ? chalk.red(`${down} down`) : chalk.gray('0 down')}`,
  );
  if (down > 0) process.exitCode = 1;
}
