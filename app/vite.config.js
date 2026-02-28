import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Lua_de_Mel_Dashboard',
        short_name: 'Lua de Mel',
        description: 'Dashboard para a nossa Lua de Mel',
        theme_color: '#211116',
        background_color: '#211116',
        display: "standalone",
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3038/3038088.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3038/3038088.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
})
