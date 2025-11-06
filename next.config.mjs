/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora errori TypeScript durante la build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurazione immagini
  images: {
    // Disabilita l'ottimizzazione immagini per il deployment statico
    unoptimized: true,
    
    // Domini consentiti per le immagini
    domains: [
      'ojbpfjpgriplodjkhnyv.supabase.co',  // Dominio Supabase
      'ojbpfjpgriplodjkhnyv.supabase.in',  // Dominio alternativo Supabase
      'lh3.googleusercontent.com',        // Per avatar Google
      'avatars.githubusercontent.com'     // Per avatar GitHub
    ],
    
    // Formati immagine supportati
    formats: ['image/avif', 'image/webp'],
    
    // Dimensione massima del file immagine (in byte)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Configurazione di sicurezza
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Abilita il supporto a React Strict Mode
  reactStrictMode: true,
  
  // Configurazione per il supporto PWA (opzionale)
  // Nota: Richiede next-pwa
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  },
  
  // Abilita il supporto a Webpack 5
  future: {
    webpack5: true,
  },
  
  // Configurazione per l'export statico (se necessario)
  output: 'standalone',
  
  // Abilita il supporto a styled-components (se usato)
  compiler: {
    styledComponents: true,
  }
}

export default nextConfig