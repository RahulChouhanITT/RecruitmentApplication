import { afterAll, afterEach, beforeAll } from 'vitest';
import { clearDB, connectDB, disconnectDB } from './db';

const shouldUseDatabase =
  process.env.VITEST_ENABLE_DB === 'true' || process.env.TEST_SUITE_TYPE === 'integration';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  if (shouldUseDatabase) {
    await connectDB();
  }
});

afterEach(async () => {
  if (shouldUseDatabase) {
    await clearDB();
  }
});

afterAll(async () => {
  if (shouldUseDatabase) {
    await disconnectDB();
  }
});
