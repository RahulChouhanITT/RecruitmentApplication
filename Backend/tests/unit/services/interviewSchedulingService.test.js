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
const userFindOne = vitest_1.vi.fn();
const interviewFindOneAndUpdate = vitest_1.vi.fn();
const emitInterviewUpdated = vitest_1.vi.fn();
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
        findOne: userFindOne,
    },
}));
vitest_1.vi.mock('../../../src/models/interviewModel', () => ({
    InterviewModel: {
        findOneAndUpdate: interviewFindOneAndUpdate,
    },
    INTERVIEW_STATUSES: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
}));
vitest_1.vi.mock('../../../src/events/eventBus', () => ({
    emitInterviewUpdated,
}));
const createSessionEntityQuery = (resolvedValue) => ({
    session: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
});
const createSelectSessionEntityQuery = (resolvedValue) => ({
    select: vitest_1.vi.fn().mockReturnThis(),
    session: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
});
(0, vitest_1.describe)('interviewSchedulingService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)('builds a scheduling plan with candidate and interviewer ids', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-1' },
            candidateId: { toString: () => '507f1f77bcf86cd799439011' },
            jobId: 'job-1',
        };
        const candidate = {
            _id: { toString: () => '507f1f77bcf86cd799439011' },
            name: 'Ava Candidate',
            email: 'ava@example.com',
        };
        const interviewer = {
            _id: { toString: () => '507f1f77bcf86cd799439012' },
            name: 'Ishaan Interviewer',
            email: 'ishaan@example.com',
            role: 'interviewer',
        };
        applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
        jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-1', title: 'Frontend Engineer' }));
        userFindById
            .mockReturnValueOnce(createSelectSessionEntityQuery(candidate))
            .mockReturnValueOnce(createSelectSessionEntityQuery(interviewer));
        const { scheduleApplicationInterview } = await Promise.resolve().then(() => __importStar(require('../../../src/services/interview/interviewSchedulingService')));
        const result = await scheduleApplicationInterview('application-1', {
            interviewerId: '507f1f77bcf86cd799439012',
            interviewerName: '',
            interviewDate: '2026-04-05',
            interviewTime: '10:30',
            notes: 'Bring portfolio',
        });
        (0, vitest_1.expect)(result).toEqual({
            data: {
                candidateId: '507f1f77bcf86cd799439011',
                interviewerId: '507f1f77bcf86cd799439012',
            },
            integrationPayload: {
                kind: 'googleMeetEvent',
                summary: 'Interview - Frontend Engineer',
                description: 'Bring portfolio',
                startDateTime: '2026-04-05T05:00:00.000Z',
                endDateTime: '2026-04-05T06:00:00.000Z',
            },
        });
    });
    (0, vitest_1.it)('falls back to interviewer name lookup when interviewer id is missing', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-2' },
            candidateId: { toString: () => '507f1f77bcf86cd799439013' },
            jobId: 'job-2',
        };
        const candidate = {
            _id: { toString: () => '507f1f77bcf86cd799439013' },
            name: 'Riya Candidate',
            email: 'riya@example.com',
        };
        const interviewer = {
            _id: { toString: () => '507f1f77bcf86cd799439014' },
            name: 'Maya Interviewer',
            email: 'maya@example.com',
            role: 'interviewer',
        };
        applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
        jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-2', title: 'Backend Engineer' }));
        userFindById.mockReturnValueOnce(createSelectSessionEntityQuery(candidate));
        userFindOne.mockReturnValue(createSelectSessionEntityQuery(interviewer));
        const { scheduleApplicationInterview } = await Promise.resolve().then(() => __importStar(require('../../../src/services/interview/interviewSchedulingService')));
        const result = await scheduleApplicationInterview('application-2', {
            interviewerId: '',
            interviewerName: 'Maya Interviewer',
            interviewDate: '2026-04-06',
            interviewTime: '11:00',
            notes: '',
        });
        (0, vitest_1.expect)(userFindOne).toHaveBeenCalled();
        (0, vitest_1.expect)(result.data).toEqual({
            candidateId: '507f1f77bcf86cd799439013',
            interviewerId: '507f1f77bcf86cd799439014',
        });
    });
    (0, vitest_1.it)('requires a valid interviewer when neither id nor name resolves', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-3' },
            candidateId: { toString: () => '507f1f77bcf86cd799439015' },
            jobId: 'job-3',
        };
        applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
        jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-3', title: 'QA Engineer' }));
        userFindById
            .mockReturnValueOnce(createSelectSessionEntityQuery({ _id: { toString: () => '507f1f77bcf86cd799439015' }, name: 'Noel', email: 'noel@example.com' }))
            .mockReturnValueOnce(createSelectSessionEntityQuery(null));
        userFindOne.mockReturnValue(createSelectSessionEntityQuery(null));
        const { scheduleApplicationInterview } = await Promise.resolve().then(() => __importStar(require('../../../src/services/interview/interviewSchedulingService')));
        await (0, vitest_1.expect)(scheduleApplicationInterview('application-3', {
            interviewerId: '',
            interviewerName: '',
            interviewDate: '2026-04-06',
            interviewTime: '11:30',
            notes: '',
        })).rejects.toMatchObject({
            message: 'Valid interviewer is required',
            statusCode: 400,
        });
    });
    (0, vitest_1.it)('finalizes interview scheduling, updates application status, and emits interview update', async () => {
        const applicationEntity = {
            _id: { toString: () => 'application-4' },
            candidateId: { toString: () => '507f1f77bcf86cd799439016' },
            jobId: 'job-4',
            status: 'SHORTLISTED',
            save: vitest_1.vi.fn().mockResolvedValue(undefined),
        };
        const candidate = {
            _id: { toString: () => '507f1f77bcf86cd799439016' },
            name: 'Aarav Candidate',
            email: 'aarav@example.com',
        };
        const interviewer = {
            _id: { toString: () => '507f1f77bcf86cd799439017' },
            name: 'Neha Interviewer',
            email: 'neha@example.com',
            role: 'interviewer',
        };
        const interviewRecord = {
            _id: { toString: () => 'interview-1' },
            interviewDate: '2026-04-07',
            interviewTime: '14:00',
            meetingLink: 'https://meet.example.com/interview-1',
            notes: 'Portfolio review',
        };
        applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
        jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-4', title: 'Product Designer' }));
        userFindById
            .mockReturnValueOnce(createSelectSessionEntityQuery(candidate))
            .mockReturnValueOnce(createSelectSessionEntityQuery(interviewer));
        interviewFindOneAndUpdate.mockResolvedValue(interviewRecord);
        const { finalizeApplicationInterviewSchedule } = await Promise.resolve().then(() => __importStar(require('../../../src/services/interview/interviewSchedulingService')));
        const result = await finalizeApplicationInterviewSchedule('application-4', '507f1f77bcf86cd799439018', {
            interviewerId: '507f1f77bcf86cd799439017',
            interviewerName: '',
            interviewDate: '2026-04-07',
            interviewTime: '14:00',
            notes: 'Portfolio review',
        }, 'https://meet.example.com/interview-1');
        (0, vitest_1.expect)(applicationEntity.status).toBe('INTERVIEW_SCHEDULED');
        (0, vitest_1.expect)(applicationEntity.save).toHaveBeenCalled();
        (0, vitest_1.expect)(interviewFindOneAndUpdate).toHaveBeenCalled();
        (0, vitest_1.expect)(emitInterviewUpdated).toHaveBeenCalledWith({
            interviewId: 'interview-1',
            applicationId: 'application-4',
            candidateId: '507f1f77bcf86cd799439016',
            interviewerId: '507f1f77bcf86cd799439017',
            candidateName: 'Aarav Candidate',
            interviewerName: 'Neha Interviewer',
            jobTitle: 'Product Designer',
            interviewDate: '2026-04-07',
            interviewTime: '14:00',
        });
        (0, vitest_1.expect)(result.notificationPayload?.kind).toBe('interviewInvite');
    });
});
