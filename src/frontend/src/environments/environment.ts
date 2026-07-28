/**
 * Configuração de ambiente. `apiUrl` é lido em runtime de `window.__env` (feature 024),
 * gerado por `env.js` — no container, a partir da variável de ambiente `API_URL`.
 * Em desenvolvimento, `public/env.js` fornece o default (localhost).
 */
export const environment = {
  get apiUrl(): string {
    return (globalThis as { __env?: { apiUrl?: string } }).__env?.apiUrl
      ?? 'http://localhost:5179/api/v1';
  },
};
