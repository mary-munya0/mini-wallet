import app from './app.js';
import { initializeDatabase } from './db/init.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Wallet API running on http://localhost:${PORT}`);
  });
};

startServer();
