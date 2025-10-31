/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />
// 31.10.2025 uus commit, toimiiko azure-autentikaatio
interface ImportMetaEnv {
  readonly VITE_URL: string;
  readonly VITE_PRIVACY_POLICY: string;
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
