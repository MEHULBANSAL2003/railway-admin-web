import { config } from 'dotenv';
import { spawn } from 'child_process';
import { resolve } from 'path';

// Load the .env file from environment folder
const result = config({ path: resolve(process.cwd(), 'environment', '.env') });

// Get the active environment
const activeEnv = process.env.VITE_ACTIVE_ENV || 'development';

// Run vite with the correct mode
const vite = spawn('vite', ['--mode', activeEnv], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env } // Pass all environment variables
});

vite.on('close', (code) => {
  process.exit(code);
});
