import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The DS packages are unpublished workspace siblings resolved by symlink.
  // Vite must be allowed to follow those links out of this directory, and must
  // not pre-bundle them, or edits to a component would not show up here.
  server: { fs: { allow: ['../../..'] } },
  optimizeDeps: {
    exclude: ['@dhcw/sr-react', '@dhcw/sr-web', '@dhcw/sr-tokens', '@dhcw/sr-icons'],
  },
});
