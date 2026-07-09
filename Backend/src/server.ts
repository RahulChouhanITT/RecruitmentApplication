import './configuration/env';
import http from 'http';
import { connectDB } from './configuration/databaseConnection';
import { setupSocket } from './configuration/socketConfiguration';
import app from './app';
import './configuration/cloudinaryConfiguration';
import { CONFIGURATION_CONSTANTS } from './utils/constants/configurationConstants';
import { env } from './configuration/env';

const startServer = async (): Promise<void> => {
  await connectDB();
  const server = http.createServer(app);
  setupSocket(server);

  server.listen(env.PORT, () => {
    process.stdout.write(`${CONFIGURATION_CONSTANTS.SERVER.START_MESSAGE_PREFIX}${env.PORT}\n`);
  });
};

void startServer();
