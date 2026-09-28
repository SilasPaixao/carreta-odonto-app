/**
 * Configurações de ambiente da aplicação OdontoMóvel
 * Carrega variáveis tipadas do .env para uso em toda a aplicação.
 */
export const ENV = {
  // Nome e identificação da aplicação
  appName: import.meta.env.VITE_APP_NAME || 'OdontoMóvel',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? 'production' : 'development'),

  // URLs de acesso e API (compatível com Proxy Nginx da VPS)
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  // Prefixo para chaves de persistência local (permite isolar bancos e versões na VPS)
  storagePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'odontomovel_prod_',

  // Configurações para relatórios e prestação de contas
  organizationName: import.meta.env.VITE_ORGANIZATION_NAME || 'OdontoMóvel Gestão de Frotas Odontológicas',
  defaultState: import.meta.env.VITE_DEFAULT_STATE || 'SP',

  // Helpers de ambiente
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};
