import api from "../lib/axios";
import type { Setting, SettingsRecord } from "../types/settings";

// GET /settings — backend may return Setting[] or SettingsRecord
// Normalise to SettingsRecord for easy key lookup
export async function getSettings(): Promise<SettingsRecord> {
  const response = await api.get<Setting[] | SettingsRecord>("/settings");
  const data = response.data;

  // If array of {key, value} objects → convert to record
  if (Array.isArray(data)) {
    return Object.fromEntries(data.map(s => [s.key, s.value]));
  }
  // Already a record
  return data as SettingsRecord;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await api.put("/settings", { [key]: value });
}
