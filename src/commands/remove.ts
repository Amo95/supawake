import chalk from 'chalk';
import { removeProject } from '../config';

export function removeCommand(name: string): void {
  try {
    removeProject(name);
    console.log(chalk.green(`✓ Removed project "${name}"`));
  } catch (err) {
    console.error(chalk.red(`✗ ${(err as Error).message}`));
    process.exitCode = 1;
  }
}
