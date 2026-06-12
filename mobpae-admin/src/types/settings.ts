// Prisma Setting model is a key-value store: each row is one config entry.
export interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// Helper type: settings resolved into a record for easy access by key
export type SettingsRecord = Record<string, string>;

export type UpdateSettingDto = { key: string; value: string };
