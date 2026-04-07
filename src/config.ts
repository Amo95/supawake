import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Config, Project } from './types';

export const CONFIG_DIR = path.join(os.homedir(), '.config', 'supawake');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  projects: [],
  settings: {
    defaultInterval: '0 0 */3 * *',
    notifications: {
      enabled: false,
      webhookUrl: '',
    },
  },
};

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Config>;
    return {
      projects: parsed.projects ?? [],
      settings: {
        ...DEFAULT_CONFIG.settings,
        ...(parsed.settings ?? {}),
        notifications: {
          ...DEFAULT_CONFIG.settings.notifications,
          ...(parsed.settings?.notifications ?? {}),
        },
      },
    };
  } catch (err) {
    throw new Error(
      `Failed to parse config at ${CONFIG_PATH}: ${(err as Error).message}`,
    );
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export function addProject(project: Project): Config {
  const config = loadConfig();
  if (config.projects.some((p) => p.name === project.name)) {
    throw new Error(`A project named "${project.name}" already exists.`);
  }
  config.projects.push(project);
  saveConfig(config);
  return config;
}

export function removeProject(name: string): Config {
  const config = loadConfig();
  const before = config.projects.length;
  config.projects = config.projects.filter((p) => p.name !== name);
  if (config.projects.length === before) {
    throw new Error(`No project named "${name}" found.`);
  }
  saveConfig(config);
  return config;
}
