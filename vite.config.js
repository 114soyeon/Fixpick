import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // import "@/utils/common/date" → src/utils/common/date (어느 파일에서든 같은 경로로 써요)
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
