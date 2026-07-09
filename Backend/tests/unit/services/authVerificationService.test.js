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
const bcryptCompare = vitest_1.vi.fn();
const userFindOne = vitest_1.vi.fn();
const userFindById = vitest_1.vi.fn();
const userFindByIdAndUpdate = vitest_1.vi.fn();
vitest_1.vi.mock('bcryptjs', () => ({
    default: {
        hash: bcryptHash,
        compare: bcryptCompare,
    },
}));
vitest_1.vi.mock('../../../src/models/userModel', () => ({
    UserModel: {
        findOne: userFindOne,
        findById: userFindById,
        findByIdAndUpdate: userFindByIdAndUpdate,
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
(0, vitest_1.describe)('authVerificationService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.resetAllMocks();
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0.234567);
        bcryptHash.mockResolvedValue('hashed-otp');
    });
    (0, vitest_1.it)('verifies otp and auto-approves candidates', async () => {
        const save = vitest_1.vi.fn().mockResolvedValue(undefined);
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439301',
            email: 'ava@example.com',
            name: 'Ava Candidate',
            role: 'candidate',
            otpCodeHash: 'stored-hash',
            otpExpiryTime: new Date(Date.now() + 60000),
            otpAttemptCount: 0,
            isEmailVerified: false,
            isApproved: false,
            save,
        }));
        bcryptCompare.mockResolvedValue(true);
        userFindById.mockReturnValue(createSelectLeanQuery({
            _id: '507f1f77bcf86cd799439301',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: true,
            isApproved: true,
        }));
        const { verifyEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        const result = await verifyEmailOtp({
            email: 'AVA@example.com',
            otp: '123456',
        });
        (0, vitest_1.expect)(save).toHaveBeenCalled();
        (0, vitest_1.expect)(result.data).toEqual({
            _id: '507f1f77bcf86cd799439301',
            name: 'Ava Candidate',
            email: 'ava@example.com',
            role: 'candidate',
            profileCompleted: false,
            isEmailVerified: true,
            isApproved: true,
        });
        (0, vitest_1.expect)(result.notificationPayload).toBeNull();
    });
    (0, vitest_1.it)('verifies otp for hr users and returns approval-pending notification payload', async () => {
        const save = vitest_1.vi.fn().mockResolvedValue(undefined);
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439302',
            email: 'hr@example.com',
            name: 'HR User',
            role: 'hr',
            otpCodeHash: 'stored-hash',
            otpExpiryTime: new Date(Date.now() + 60000),
            otpAttemptCount: 0,
            isEmailVerified: false,
            isApproved: false,
            save,
        }));
        bcryptCompare.mockResolvedValue(true);
        userFindById.mockReturnValue(createSelectLeanQuery({
            _id: '507f1f77bcf86cd799439302',
            name: 'HR User',
            email: 'hr@example.com',
            role: 'hr',
            profileCompleted: false,
            isEmailVerified: true,
            isApproved: false,
        }));
        const { verifyEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        const result = await verifyEmailOtp({
            email: 'hr@example.com',
            otp: '123456',
        });
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'approvalPending',
            emailAddress: 'hr@example.com',
            userName: 'HR User',
        });
    });
    (0, vitest_1.it)('increments otp attempts and rejects invalid otp values', async () => {
        const save = vitest_1.vi.fn().mockResolvedValue(undefined);
        const user = {
            _id: '507f1f77bcf86cd799439303',
            email: 'user@example.com',
            name: 'User',
            role: 'candidate',
            otpCodeHash: 'stored-hash',
            otpExpiryTime: new Date(Date.now() + 60000),
            otpAttemptCount: 1,
            isEmailVerified: false,
            isApproved: false,
            save,
        };
        userFindOne.mockReturnValue(createSelectQuery(user));
        bcryptCompare.mockResolvedValue(false);
        const { verifyEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        await (0, vitest_1.expect)(verifyEmailOtp({
            email: 'user@example.com',
            otp: '000000',
        })).rejects.toMatchObject({
            message: 'Invalid OTP',
            statusCode: 400,
        });
        (0, vitest_1.expect)(user.otpAttemptCount).toBe(2);
        (0, vitest_1.expect)(save).toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects expired otp values', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439304',
            email: 'user@example.com',
            name: 'User',
            role: 'candidate',
            otpCodeHash: 'stored-hash',
            otpExpiryTime: new Date(Date.now() - 60000),
            otpAttemptCount: 0,
            save: vitest_1.vi.fn(),
        }));
        const { verifyEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        await (0, vitest_1.expect)(verifyEmailOtp({
            email: 'user@example.com',
            otp: '123456',
        })).rejects.toMatchObject({
            message: 'OTP has expired. Please request a new OTP',
            statusCode: 400,
        });
    });
    (0, vitest_1.it)('resends otp for unverified users', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439305',
            email: 'user@example.com',
            name: 'User Name',
            isEmailVerified: false,
        }));
        userFindByIdAndUpdate.mockResolvedValue(undefined);
        const { resendEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        const result = await resendEmailOtp({
            email: 'USER@example.com',
        });
        (0, vitest_1.expect)(userFindByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439305', {
            $set: {
                otpCodeHash: 'hashed-otp',
                otpExpiryTime: vitest_1.expect.any(Date),
                otpAttemptCount: 0,
            },
        });
        (0, vitest_1.expect)(result.data).toEqual({
            otpCode: vitest_1.expect.any(String),
        });
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'otpVerification',
            emailAddress: 'user@example.com',
            otpCode: vitest_1.expect.any(String),
            userName: 'User Name',
        });
    });
    (0, vitest_1.it)('rejects otp resend for already verified users', async () => {
        userFindOne.mockReturnValue(createSelectQuery({
            _id: '507f1f77bcf86cd799439306',
            email: 'verified@example.com',
            name: 'Verified User',
            isEmailVerified: true,
        }));
        const { resendEmailOtp } = await Promise.resolve().then(() => __importStar(require('../../../src/services/auth/authVerificationService')));
        await (0, vitest_1.expect)(resendEmailOtp({
            email: 'verified@example.com',
        })).rejects.toMatchObject({
            message: 'Email verified successfully',
            statusCode: 400,
        });
    });
});
