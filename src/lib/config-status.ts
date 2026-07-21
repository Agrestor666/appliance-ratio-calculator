export interface ConfigStatus {
  name: string;
  configured: boolean;
  message: string;
  docsUrl?: string;
  docsLabel?: string;
}

/** Optional setup warnings for the layout banner. Empty while Auth/Supabase is deferred. */
export const configStatuses: ConfigStatus[] = [];

export const missingConfigs = configStatuses.filter((s) => !s.configured);
