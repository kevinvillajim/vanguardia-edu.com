/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ANALYTICS_KEY: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_STORAGE_BUCKET_URL: string;
  readonly VITE_ENABLE_LOGS: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_FEATURE_FLAGS: string;
  readonly VITE_MAINTENANCE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}