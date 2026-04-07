export interface Project {
  name: string;
  url: string;
  anonKey: string;
}

export interface NotificationSettings {
  enabled: boolean;
  webhookUrl: string;
}

export interface Settings {
  defaultInterval: string;
  notifications: NotificationSettings;
}

export interface Config {
  projects: Project[];
  settings: Settings;
}

export interface PingResult {
  project: Project;
  ok: boolean;
  status?: number;
  error?: string;
  durationMs: number;
}
