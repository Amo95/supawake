import { PingResult, Project } from './types';

export async function pingProject(project: Project, timeoutMs = 15000): Promise<PingResult> {
  const start = Date.now();
  const endpoint = project.url.replace(/\/$/, '') + '/rest/v1/';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: project.anonKey,
        Authorization: `Bearer ${project.anonKey}`,
      },
      signal: controller.signal,
    });
    return {
      project,
      ok: res.status === 200,
      status: res.status,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      project,
      ok: false,
      error: (err as Error).message,
      durationMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function pingAll(projects: Project[]): Promise<PingResult[]> {
  return Promise.all(projects.map((p) => pingProject(p)));
}
