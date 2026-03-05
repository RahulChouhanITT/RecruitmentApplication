import dotenv from "dotenv";
import path from "path";
import app from "./app";
import { databaseConnectionManager } from "./configuration/databaseConnection";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = Number(process.env.APPLICATION_PORT) || 5000;

const startServer = async (): Promise<void> => {
  await databaseConnectionManager.establishDatabaseConnection();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

void startServer();
