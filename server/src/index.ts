import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || './data/pilot_telemetry.db';

async function start() {
  try {
    const { app } = await buildApp({
      dbPath: DB_PATH,
      enableSeed: true,
    });

    await app.listen({ port: PORT, host: HOST });
    console.log(`WellSync Pilot Backend listening on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Failed to start pilot backend:', err);
    process.exit(1);
  }
}

start();
