import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      // pas toujours nécessaire, mais peut aider :
      '@mui/styled-engine': '@mui/styled-engine'
    }
  }
});
