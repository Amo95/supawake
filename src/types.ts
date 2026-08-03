export interface Project {
  name: string;
  url: string;
  anonKey: string;
  /**
   * Table to read when pinging, e.g. "keepalive". When set, the ping issues a
   * PostgREST select against it, which reaches Postgres and therefore counts as
   * database activity. When unset, the ping falls back to the auth health
   * endpoint, which confirms the project responds but does NOT touch the
   * database and so will not prevent free-tier auto-pause.
   */
  table?: string;
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
  /** How many requests were sent, including retries. 1 means it worked first try. */
  attempts: number;
}
