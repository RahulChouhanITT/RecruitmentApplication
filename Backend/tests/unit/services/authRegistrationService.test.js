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
const bcryptHash = vitest_1.vi.fn();
const userFindOne = vitest_1.vi.fn();
const userCreate = vitest_1.vi.fn();
const userFindById = vitest_1.vi.fn();
const userFindByIdAndUpdate = vitest_1.vi.fn();
const candidateProfileCreate = vitest_1.vi.fn();
const hrProfileCreate = vitest_1.vi.fn();
const interviewerProfileCreate = vitest_1.vi.fn();
vitest_1.vi.mock('bcryptjs', () => ({
    default: {
        hash: bcryptHash,
    },
}));
vitest_1.vi.mock('../../../src/models/userModel', () => ({
    UserModel: {
        findOne: userFindOne,
        create: userCreate,
        findById: userFindById,
        findByIdAndUpdate: userFindByIdAndUpdate,
    },
}));
vitest_1.vi.mock('../../../src/models/candidateProfileModel', () => ({
    CandidateProfileModel: {
        create: candidateProfileCreate,
    },
}));
vitest_1.vi.mock('../../../src/models/hrProfileModel', () => ({
    HrProfileModel: {
        create: hrProfileCreate,
    },
}));
vitest_1.vi.mock('../../../src/models/interviewerProfileModel', () => ({
    InterviewerProfileModel: {
        create: interviewerProfileCreate,
    },
}));
const createLeanQuery = (resolvedValue) => ({
    lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
});
const createSelectLeanQuery = (resolvedValue) => ({
    select: vitest_1.vi.fn().mockReturnValue({
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    }),
});
(0, vitest_1.describe)('registerUser', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.resetAllMocks();
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0.123456);
        bcryptHash.mockResolvedValue('hashed-otp');
    });
    (0, vitest_1.it)('registers a candidate, creates profile scaffolding, and returns otp notification payload', async () => {
        userFindOne.mockReturnValue(createLeanQuery(null));
        userCreate.mockResolvedValue({
            _id: '507f1f77bcf86cd799439101',
            email: 'ava@example.com',
            name: 'Ava Candidate',
        });
        userFindByIdAndUpdate.mockResolvedValue(undefined);
        userFindById.mockReturnValue(createSelectLeanQuery({
            _id: '507f1f77bcf86cd799439101',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: false,
            isApproved: false,
        }));
        const { registerUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authRegistrationService')));
        const result = await registerUser({
            name: ' Ava Candidate ',
            email: 'AVA@example.com',
            password: 'Password123',
            role: 'candidate',
        });
        (0, vitest_1.expect)(userCreate).toHaveBeenCalledWith({
            name: 'Ava Candidate',
            email: 'ava@example.com',
            passwordHash: 'Password123',
            role: 'candidate',
        });
        (0, vitest_1.expect)(candidateProfileCreate).toHaveBeenCalledWith({
            userId: '507f1f77bcf86cd799439101',
        });
        (0, vitest_1.expect)(hrProfileCreate).not.toHaveBeenCalled();
        (0, vitest_1.expect)(interviewerProfileCreate).not.toHaveBeenCalled();
        (0, vitest_1.expect)(userFindByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439101', {
            $set: {
                otpCodeHash: 'hashed-otp',
                otpExpiryTime: vitest_1.expect.any(Date),
                otpAttemptCount: 0,
            },
        });
        (0, vitest_1.expect)(result.data.user).toEqual({
            _id: '507f1f77bcf86cd799439101',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: false,
            isApproved: false,
        });
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'otpVerification',
            emailAddress: 'ava@example.com',
            otpCode: vitest_1.expect.any(String),
            userName: 'Ava Candidate',
        });
    });
    (0, vitest_1.it)('creates the correct role-specific profile for hr users', async () => {
        userFindOne.mockReturnValue(createLeanQuery(null));
        userCreate.mockResolvedValue({
            _id: '507f1f77bcf86cd799439102',
            email: 'hr@example.com',
            name: 'HR User',
        });
        userFindByIdAndUpdate.mockResolvedValue(undefined);
        userFindById.mockReturnValue(createSelectLeanQuery({
            _id: '507f1f77bcf86cd799439102',
            name: 'HR User',
            email: 'hr@example.com',
            role: 'hr',
            profileCompleted: false,
            isEmailVerified: false,
            isApproved: false,
        }));
        const { registerUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authRegistrationService')));
        await registerUser({
            name: 'HR User',
            email: 'hr@example.com',
            password: 'Password123',
            role: 'hr',
        });
        (0, vitest_1.expect)(hrProfileCreate).toHaveBeenCalledWith({
            userId: '507f1f77bcf86cd799439102',
        });
        (0, vitest_1.expect)(candidateProfileCreate).not.toHaveBeenCalled();
        (0, vitest_1.expect)(interviewerProfileCreate).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects duplicate email registration', async () => {
        userFindOne.mockReturnValue(createLeanQuery({ _id: 'existing-user' }));
        const { registerUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authRegistrationService')));
        await (0, vitest_1.expect)(registerUser({
            name: 'Duplicate User',
            email: 'duplicate@example.com',
            password: 'Password123',
            role: 'candidate',
        })).rejects.toMatchObject({
            message: 'Email is already registered',
            statusCode: 409,
        });
        (0, vitest_1.expect)(userCreate).not.toHaveBeenCalled();
        (0, vitest_1.expect)(candidateProfileCreate).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects invalid registration payloads before touching persistence', async () => {
        const { registerUser } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authRegistrationService')));
        await (0, vitest_1.expect)(registerUser({
            name: '',
            email: '',
            password: 'short',
            role: 'candidate',
        })).rejects.toMatchObject({
            message: 'Validation failed',
            statusCode: 400,
        });
        (0, vitest_1.expect)(userFindOne).not.toHaveBeenCalled();
    });
});
