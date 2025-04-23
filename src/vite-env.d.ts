/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_URL: string;
  readonly VITE_PRIVACY_POLICY: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
