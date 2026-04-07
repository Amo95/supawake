import chalk from 'chalk';
import prompts from 'prompts';
import { addProject } from '../config';

export async function addCommand(): Promise<void> {
  const answers = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Project name (a short label):',
      validate: (v: string) => (v.trim().length > 0 ? true : 'Name is required'),
    },
    {
      type: 'text',
      name: 'url',
      message: 'Supabase project URL (https://xyz.supabase.co):',
      validate: (v: string) =>
        /^https?:\/\/.+\.supabase\.co\/?$/i.test(v.trim())
          ? true
          : 'Must look like https://<ref>.supabase.co',
    },
    {
      type: 'password',
      name: 'anonKey',
      message: 'Anon (public) API key:',
      validate: (v: string) => (v.trim().length > 20 ? true : 'Anon key looks too short'),
    },
  ]);

  if (!answers.name || !answers.url || !answers.anonKey) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  try {
    addProject({
      name: answers.name.trim(),
      url: answers.url.trim().replace(/\/$/, ''),
      anonKey: answers.anonKey.trim(),
    });
    console.log(chalk.green(`✓ Added project "${answers.name}"`));
  } catch (err) {
    console.error(chalk.red(`✗ ${(err as Error).message}`));
    process.exitCode = 1;
  }
}
