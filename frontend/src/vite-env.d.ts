/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WAVE_PAY_URL?: string;
  readonly VITE_ORANGE_MONEY_PAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
