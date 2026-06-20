// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [
//     react(),
//   ],
//    server: {
//     host: "0.0.0.0",
//   },
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: "0.0.0.0", // Exposes to network
    hmr: {
      clientPort: 5173, // Forces the websocket to use the standard Vite port
    },
    watch: {
      usePolling: true, // Add this if you are using WSL or a Virtual Machine
    }
  },
})



