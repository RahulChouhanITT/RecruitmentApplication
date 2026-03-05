import mongoose from "mongoose";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";

class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }

    return DatabaseConnectionManager.instance;
  }

  public async establishDatabaseConnection(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await mongoose.connect(process.env.MONGO_DATABASE_URL as string);
      this.isConnected = true;
      console.log(APPLICATION_MESSAGES.DATABASE.CONNECTION_SUCCESS);
    } catch (error) {
      console.error(APPLICATION_MESSAGES.DATABASE.CONNECTION_ERROR);
      console.error((error as Error).message);
    }
  }
}

export const databaseConnectionManager = DatabaseConnectionManager.getInstance();
