import dotenv from "dotenv";
import http from "http";
import path from "path";
import { databaseConnectionManager } from "./configuration/databaseConnection";
import { initializeSocketServer } from "./configuration/socketConfiguration";
import { CONFIGURATION_CONSTANTS } from "./utils/constants/configurationConstants";

dotenv.config({ path: path.resolve(__dirname, CONFIGURATION_CONSTANTS.SERVER.ENV_PATH) });

const port = Number(process.env.APPLICATION_PORT);

const startServer = async (): Promise<void> => {
  const { default: app } = await import("./app");
  await import("./configuration/cloudinaryConfiguration");
  await databaseConnectionManager.establishDatabaseConnection();
  const server = http.createServer(app);
  initializeSocketServer(server);

  server.listen(port, () => {
    console.log(`${CONFIGURATION_CONSTANTS.SERVER.START_MESSAGE_PREFIX}${port}`);
  });
};

void startServer();
