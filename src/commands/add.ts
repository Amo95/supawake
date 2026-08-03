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
    {
      type: 'text',
      name: 'table',
      message: 'Anon-readable table to read on each ping (blank = auth check only):',
      initial: 'keepalive',
    },
  ]);

  if (!answers.name || !answers.url || !answers.anonKey) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  const table = (answers.table ?? '').trim();

  try {
    addProject({
      name: answers.name.trim(),
      url: answers.url.trim().replace(/\/$/, ''),
      anonKey: answers.anonKey.trim(),
      ...(table ? { table } : {}),
    });
    console.log(chalk.green(`✓ Added project "${answers.name}"`));
    if (!table) {
      console.log(
        chalk.yellow(
          '  No table set — pings will check auth only and will not keep the database awake.',
        ),
      );
    }
  } catch (err) {
    console.error(chalk.red(`✗ ${(err as Error).message}`));
    process.exitCode = 1;
  }
}
