import chalk from 'chalk';
import { loadConfig, CONFIG_PATH } from '../config';

export function listCommand(): void {
  const config = loadConfig();
  if (config.projects.length === 0) {
    console.log(chalk.yellow('No projects configured.'));
    console.log(chalk.gray(`Run "supawake add" to add one. Config: ${CONFIG_PATH}`));
    return;
  }
  console.log(chalk.bold(`\n${config.projects.length} project(s) configured:\n`));
  for (const p of config.projects) {
    console.log(`  ${chalk.cyan(p.name)}`);
    console.log(`    URL:  ${p.url}`);
    console.log(`    Key:  ${p.anonKey.slice(0, 8)}…${p.anonKey.slice(-4)}`);
  }
  console.log(chalk.gray(`\nConfig: ${CONFIG_PATH}`));
  console.log(chalk.gray(`Default schedule: ${config.settings.defaultInterval}`));
}
