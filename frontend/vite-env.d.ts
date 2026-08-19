/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_PORT: string;
    VITE_API_BASE_URL?: string; // optional: more envs
  }
  
  interface ImportMeta {
    env: ImportMetaEnv;
  }
  