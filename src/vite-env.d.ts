/// <reference types="vite/client" />

// sql.js ships its WASM binary; we import it as a URL so Vite bundles it.
declare module '*.wasm?url' {
  const src: string;
  export default src;
}
