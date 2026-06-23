/// <reference types="vite/client" />

// sql.js ships its WASM binary; we import it as a URL so Vite bundles it.
declare module '*.wasm?url' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
