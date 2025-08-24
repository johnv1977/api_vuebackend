/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

declare module '@assets/*' {
  const value: string
  export default value
}
