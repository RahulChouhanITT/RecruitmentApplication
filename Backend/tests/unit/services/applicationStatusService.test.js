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
const applicationFindById = vitest_1.vi.fn();
const jobFindById = vitest_1.vi.fn();
const userFindById = vitest_1.vi.fn();
const interviewFindOne = vitest_1.vi.fn();
const feedbackFindOne = vitest_1.vi.fn();
const emitApplicationStatusUpdated = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/models/applicationModel', () => ({
    ApplicationModel: {
        findById: applicationFindById,
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
vitest_1.vi.mock('../../../src/models/interviewModel', () => ({
    InterviewModel: {
        findOne: interviewFindOne,
    },
    INTERVIEW_STATUSES: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
}));
vitest_1.vi.mock('../../../src/models/feedbackModel', () => ({
    FeedbackModel: {
        findOne: feedbackFindOne,
    },
}));
vitest_1.vi.mock('../../../src/events/eventBus', () => ({
    emitApplicationStatusUpdated,
}));
const createSessionLeanQuery = (resolvedValue) => {
    const chain = {
        session: vitest_1.vi.fn().mockReturnThis(),
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    };
    return chain;
};
const createSelectSessionLeanQuery = (resolvedValue) => {
    const chain = {
        select: vitest_1.vi.fn().mockReturnThis(),
        session: vitest_1.vi.fn().mockReturnThis(),
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    };
    return chain;
};
const createSessionEntityQuery = (resolvedValue) => {
    const chain = {
        session: vitest_1.vi.fn().mockReturnThis(),
        then: (onFulfilled) => Promise.resolve(onFulfilled(resolvedValue)),
        catch: (onRejected) => Promise.resolve().catch(onRejected),
    };
    return chain;
};
(0, vitest_1.describe)('updateApplicationStatus', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('updates application status, emits an event, and returns email notification payload', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-1' },
            candidateId: { toString: () => 'candidate-1' },
            jobId: 'job-1',
            status: 'APPLIED',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        applicationFindById.mockReturnValue({
            session: vitest_1.vi.fn().mockResolvedValue(applicationEntity),
        });
        jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-1', title: 'Frontend Engineer' }));
        interviewFindOne.mockReturnValue(createSessionLeanQuery(null));
        userFindById.mockReturnValue(createSelectSessionLeanQuery({
            name: 'Ava Candidate',
            email: 'ava@example.com',
        }));
        const { updateApplicationStatus } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationStatusService')));
        const result = await updateApplicationStatus('application-1', 'shortlisted');
        (0, vitest_1.expect)(applicationEntity.status).toBe('SHORTLISTED');
        (0, vitest_1.expect)(applicationEntity.save).toHaveBeenCalled();
        (0, vitest_1.expect)(emitApplicationStatusUpdated).toHaveBeenCalledWith({
            applicationId: 'application-1',
            candidateId: 'candidate-1',
            candidateName: 'Ava Candidate',
            jobTitle: 'Frontend Engineer',
            status: 'SHORTLISTED',
        });
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'applicationStatusUpdated',
            candidateEmail: 'ava@example.com',
            candidateName: 'Ava Candidate',
            jobTitle: 'Frontend Engineer',
            applicationStatus: 'SHORTLISTED',
        });
    });
    (0, vitest_1.it)('rejects invalid status values before changing any application data', async () => {
        const { updateApplicationStatus } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationStatusService')));
        await (0, vitest_1.expect)(updateApplicationStatus('application-2', 'not-a-real-status')).rejects.toMatchObject({
            message: 'Invalid application status',
            statusCode: 400,
        });
        (0, vitest_1.expect)(applicationFindById).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('blocks status changes when a scheduled interview is still active', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-3' },
            candidateId: { toString: () => 'candidate-3' },
            jobId: 'job-3',
            status: 'INTERVIEW_SCHEDULED',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        applicationFindById.mockReturnValue({
            session: vitest_1.vi.fn().mockResolvedValue(applicationEntity),
        });
        jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-3', title: 'QA Engineer' }));
        interviewFindOne.mockReturnValue(createSessionLeanQuery({ _id: 'interview-1', status: 'SCHEDULED' }));
        const { updateApplicationStatus } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationStatusService')));
        await (0, vitest_1.expect)(updateApplicationStatus('application-3', 'REJECTED')).rejects.toMatchObject({
            message: 'Cancel the scheduled interview before changing application status',
            statusCode: 400,
        });
        (0, vitest_1.expect)(applicationEntity.save).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitApplicationStatusUpdated).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('requires feedback before allowing a final decision', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-4' },
            candidateId: { toString: () => 'candidate-4' },
            jobId: 'job-4',
            status: 'INTERVIEW_SCHEDULED',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        applicationFindById.mockReturnValue({
            session: vitest_1.vi.fn().mockResolvedValue(applicationEntity),
        });
        jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-4', title: 'DevOps Engineer' }));
        interviewFindOne
            .mockReturnValueOnce(createSessionLeanQuery(null))
            .mockReturnValueOnce(createSessionEntityQuery({ _id: 'interview-4', feedbackStatus: 'NEEDS_REVIEW', save: vitest_1.vi.fn() }));
        userFindById.mockReturnValue(createSelectSessionLeanQuery({
            name: 'Priya Candidate',
            email: 'priya@example.com',
        }));
        feedbackFindOne.mockReturnValue(createSessionLeanQuery(null));
        const { updateApplicationStatus } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationStatusService')));
        await (0, vitest_1.expect)(updateApplicationStatus('application-4', 'HIRED')).rejects.toMatchObject({
            message: 'Feedback must be submitted before final decision',
            statusCode: 400,
        });
        (0, vitest_1.expect)(applicationEntity.save).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitApplicationStatusUpdated).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('marks interview feedback reviewed when a final decision is recorded', async () => {
        const interviewEntity = {
            _id: 'interview-5',
            feedbackStatus: 'NEEDS_REVIEW',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        const applicationEntity = {
            _id: { toString: () => 'application-5' },
            candidateId: { toString: () => 'candidate-5' },
            jobId: 'job-5',
            status: 'INTERVIEW_SCHEDULED',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        applicationFindById.mockReturnValue({
            session: vitest_1.vi.fn().mockResolvedValue(applicationEntity),
        });
        jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-5', title: 'Product Designer' }));
        interviewFindOne
            .mockReturnValueOnce(createSessionLeanQuery(null))
            .mockReturnValueOnce(createSessionEntityQuery(interviewEntity));
        userFindById.mockReturnValue(createSelectSessionLeanQuery({
            name: 'Riya Candidate',
            email: 'riya@example.com',
        }));
        feedbackFindOne.mockReturnValue(createSessionLeanQuery({ _id: 'feedback-5' }));
        const { updateApplicationStatus } = await Promise.resolve().then(() => __importStar(require('../../../src/services/application/applicationStatusService')));
        const result = await updateApplicationStatus('application-5', 'HIRED');
        (0, vitest_1.expect)(interviewEntity.feedbackStatus).toBe('REVIEWED');
        (0, vitest_1.expect)(interviewEntity.save).toHaveBeenCalled();
        (0, vitest_1.expect)(applicationEntity.status).toBe('HIRED');
        (0, vitest_1.expect)(applicationEntity.save).toHaveBeenCalled();
        (0, vitest_1.expect)(emitApplicationStatusUpdated).toHaveBeenCalledWith({
            applicationId: 'application-5',
            candidateId: 'candidate-5',
            candidateName: 'Riya Candidate',
            jobTitle: 'Product Designer',
            status: 'HIRED',
        });
        (0, vitest_1.expect)(result.notificationPayload).toEqual({
            kind: 'applicationStatusUpdated',
            candidateEmail: 'riya@example.com',
            candidateName: 'Riya Candidate',
            jobTitle: 'Product Designer',
            applicationStatus: 'HIRED',
        });
    });
});
