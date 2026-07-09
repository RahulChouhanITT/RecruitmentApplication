"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("./db");
const shouldUseDatabase = process.env.VITEST_ENABLE_DB === 'true' || process.env.TEST_SUITE_TYPE === 'integration';
(0, vitest_1.beforeAll)(async () => {
    process.env.NODE_ENV = 'test';
    if (shouldUseDatabase) {
        await (0, db_1.connectDB)();
    }
});
(0, vitest_1.afterEach)(async () => {
    if (shouldUseDatabase) {
        await (0, db_1.clearDB)();
    }
});
(0, vitest_1.afterAll)(async () => {
    if (shouldUseDatabase) {
        await (0, db_1.disconnectDB)();
    }
});
