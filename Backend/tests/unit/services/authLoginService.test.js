"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const userFindOne = vitest_1.vi.fn();
const userFindById = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/models/userModel', () => ({
    UserModel: {
        findOne: userFindOne,
        findById: userFindById,
    },
}));
const createSelectQuery = (resolvedValue) => ({
    select: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
});
const createSelectLeanQuery = (resolvedValue) => ({
    select: vitest_1.vi.fn().mockReturnValue({
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    }),
});
(0, vitest_1.describe)('loginUser', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)('logs in an approved and verified user', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439201',
            isEmailVerified: true,
            isApproved: true,
            comparePassword: vitest_1.vi.fn().mockResolvedValue(true),
        }));
        userFindById.mockReturnValue(createSelectLeanQuery({
            _id: '507f1f77bcf86cd799439201',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: true,
            isApproved: true,
        }));
        const { loginUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authLoginService')));
        const result = await loginUser({
            email: 'AVA@example.com',
            password: 'Password123',
        });
        (0, vitest_1.expect)(result.data).toEqual({
            _id: '507f1f77bcf86cd799439201',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: true,
            isApproved: true,
        });
    });
    (0, vitest_1.it)('rejects invalid credentials when the user is missing', async () => {
        userFindOne.mockReturnValue(createSelectQuery(null));
        const { loginUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authLoginService')));
        await (0, vitest_1.expect)(loginUser({
            email: 'missing@example.com',
            password: 'Password123',
        })).rejects.toMatchObject({
            message: 'Invalid email or password',
            statusCode: 401,
        });
    });
    (0, vitest_1.it)('rejects invalid credentials when the password does not match', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439202',
            isEmailVerified: true,
            isApproved: true,
            comparePassword: vitest_1.vi.fn().mockResolvedValue(false),
        }));
        const { loginUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authLoginService')));
        await (0, vitest_1.expect)(loginUser({
            email: 'user@example.com',
            password: 'wrong-password',
        })).rejects.toMatchObject({
            message: 'Invalid email or password',
            statusCode: 401,
        });
    });
    (0, vitest_1.it)('rejects users whose email is not verified', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439203',
            isEmailVerified: false,
            isApproved: true,
            comparePassword: vitest_1.vi.fn().mockResolvedValue(true),
        }));
        const { loginUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authLoginService')));
        await (0, vitest_1.expect)(loginUser({
            email: 'user@example.com',
            password: 'Password123',
        })).rejects.toMatchObject({
            message: 'Please verify your email before login',
            statusCode: 403,
        });
    });
    (0, vitest_1.it)('rejects users who are not approved', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439204',
            isEmailVerified: true,
            isApproved: false,
            comparePassword: vitest_1.vi.fn().mockResolvedValue(true),
        }));
        const { loginUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authLoginService')));
        await (0, vitest_1.expect)(loginUser({
            email: 'user@example.com',
            password: 'Password123',
        })).rejects.toMatchObject({
            message: 'Your account is not approved yet',
            statusCode: 403,
        });
    });
});
