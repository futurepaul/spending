import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import Unfonts from "unplugin-fonts/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), Unfonts({
    custom: {
      families: [{
        name: 'Permanent Marker',
        local: 'Permanent Marker',
        src: './src/assets/fonts/PermanentMarker-Regular.ttf'
      }],
    }
  })],
})
