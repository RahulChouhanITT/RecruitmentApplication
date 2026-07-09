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
const applicationFindOne = vitest_1.vi.fn();
const applicationCreate = vitest_1.vi.fn();
const jobFindById = vitest_1.vi.fn();
const userFindById = vitest_1.vi.fn();
const emitApplicationCreated = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/models/applicationModel', () => ({
    ApplicationModel: {
        findOne: applicationFindOne,
        create: applicationCreate,
    },
}));
vitest_1.vi.mock('../../../src/models/jobModel', () => ({
    JobModel: {
        findById: jobFindById,
    },
}));
vitest_1.vi.mock('../../../src/models/userModel', () => ({
    UserModel: {
        findById: userFindById,
    },
}));
vitest_1.vi.mock('../../../src/events/eventBus', () => ({
    emitApplicationCreated,
}));
const createLeanQuery = (resolvedValue) => ({
    select: vitest_1.vi.fn().mockReturnValue({
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    }),
});
(0, vitest_1.describe)('submitJobApplication', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('creates a new application and emits an application created event', async () => {
        const createdApplication = {
            _id: { toString: () => 'application-1' },
            jobId: 'job-1',
            candidateId: '507f1f77bcf86cd799439011',
            status: 'APPLIED',
        };
        jobFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => 'job-1' },
            title: 'Frontend Engineer',
            isActive: true,
        }));
        applicationFindOne.mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(null),
        });
        applicationCreate.mockResolvedValue(createdApplication);
        userFindById.mockReturnValue(createLeanQuery({
            name: 'Ava Candidate',
            email: 'ava@example.com',
        }));
        const { submitJobApplication } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationSubmissionService')));
        const result = await submitJobApplication('job-1', '507f1f77bcf86cd799439011');
        (0, vitest_1.expect)(applicationCreate).toHaveBeenCalledWith({
            jobId: 'job-1',
            candidateId: vitest_1.expect.anything(),
            status: 'APPLIED',
        });
        (0, vitest_1.expect)(emitApplicationCreated).toHaveBeenCalledWith({
            applicationId: 'application-1',
            jobId: 'job-1',
            candidateId: '507f1f77bcf86cd799439011',
            candidateName: 'Ava Candidate',
            jobTitle: 'Frontend Engineer',
        });
        (0, vitest_1.expect)(result).toEqual({
            data: createdApplication,
            notificationPayload: {
                kind: 'jobApplicationConfirmed',
                candidateEmail: 'ava@example.com',
                candidateName: 'Ava Candidate',
                jobTitle: 'Frontend Engineer',
            },
        });
    });
    (0, vitest_1.it)('rejects applications when the job is not available', async () => {
        jobFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => 'job-2' },
            title: 'Backend Engineer',
            isActive: false,
        }));
        applicationFindOne.mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(null),
        });
        const { submitJobApplication } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationSubmissionService')));
        await (0, vitest_1.expect)(submitJobApplication('job-2', '507f1f77bcf86cd799439012')).rejects.toMatchObject({
            message: 'Job is not available for application',
            statusCode: 400,
        });
        (0, vitest_1.expect)(applicationCreate).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitApplicationCreated).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects duplicate applications for the same job and candidate', async () => {
        jobFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => 'job-3' },
            title: 'QA Engineer',
            isActive: true,
        }));
        applicationFindOne.mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue({ _id: 'existing-application' }),
        });
        const { submitJobApplication } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationSubmissionService')));
        await (0, vitest_1.expect)(submitJobApplication('job-3', '507f1f77bcf86cd799439013')).rejects.toMatchObject({
            message: 'You already applied for this job',
            statusCode: 409,
        });
        (0, vitest_1.expect)(applicationCreate).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('returns a confirmation payload even when the candidate profile cannot be resolved', async () => {
        const createdApplication = {
            _id: { toString: () => 'application-4' },
            jobId: 'job-4',
            candidateId: '507f1f77bcf86cd799439014',
            status: 'APPLIED',
        };
        jobFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => 'job-4' },
            title: 'DevOps Engineer',
            isActive: true,
        }));
        applicationFindOne.mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(null),
        });
        applicationCreate.mockResolvedValue(createdApplication);
        userFindById.mockReturnValue(createLeanQuery(null));
        const { submitJobApplication } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationSubmissionService')));
        const result = await submitJobApplication('job-4', '507f1f77bcf86cd799439014');
        (0, vitest_1.expect)(emitApplicationCreated).not.toHaveBeenCalled();
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'jobApplicationConfirmed',
            candidateEmail: undefined,
            candidateName: '',
            jobTitle: 'DevOps Engineer',
        });
    });
});
