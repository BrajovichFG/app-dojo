// Configuración de Conexión a Supabase (Oficial Dojo Shito Ryu)
export const SUPABASE_CONFIG = {
  // URL del proyecto en Supabase
  url: 'https://tiidxxdalfurzprzszdy.supabase.co',

  // API Key pública anon de Supabase
  anonKey: 'sb_publishable_bmvkyKJZpyxdJYM7jzik0A_QKJvGmdN',

  // Función de verificación de credenciales
  isConfigured: function(): boolean {
    return Boolean(this.url) && Boolean(this.anonKey) && this.url.startsWith('https://');
  }
};
