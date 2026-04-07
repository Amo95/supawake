import { PingResult, NotificationSettings } from './types';

export async function notifyFailures(
  results: PingResult[],
  settings: NotificationSettings,
): Promise<void> {
  if (!settings.enabled || !settings.webhookUrl) return;
  const failures = results.filter((r) => !r.ok);
  if (failures.length === 0) return;

  const text =
    `supawake: ${failures.length} project(s) failed:\n` +
    failures
      .map((f) => `- ${f.project.name}: ${f.error ?? `HTTP ${f.status}`}`)
      .join('\n');

  try {
    await fetch(settings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    // swallow — we don't want notification errors to crash the pinger
  }
}
