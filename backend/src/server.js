import app from './app.js';
import { connectDB } from './config/db.js';
import { env, isCloudinaryConfigured } from './config/env.js';
import { runJobMaintenance } from './services/jobService.js';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Job Quest API listening on port ${env.port} (${env.nodeEnv})`);
    console.log(`File storage: ${isCloudinaryConfigured ? 'Cloudinary' : 'local disk (src/uploads)'}`);
  });

  // Expire old jobs and warn employers about jobs closing soon: once at start, then hourly.
  const maintain = () => runJobMaintenance().catch((error) => console.error('Job maintenance failed:', error.message));
  maintain();
  setInterval(maintain, 60 * 60 * 1000);
}

start().catch((error) => {
  console.error('Could not start the server:', error.message);
  process.exit(1);
});
