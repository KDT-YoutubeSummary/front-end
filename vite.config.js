import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 백엔드 설정에 맞춰 포트번호 5174로 수정. 배포시 수정해야할 가능성 있음
  },
})
