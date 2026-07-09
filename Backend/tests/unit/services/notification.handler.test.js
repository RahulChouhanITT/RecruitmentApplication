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
const createNotification = vitest_1.vi.fn();
const getSocketServer = vitest_1.vi.fn();
const findById = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/services/notification/notification.service', () => ({
    createNotification,
}));
vitest_1.vi.mock('../../../src/socket/socketServer', () => ({
    getSocketServer,
}));
vitest_1.vi.mock('../../../src/models/jobModel', () => ({
    JobModel: {
        findById,
    },
}));
const flushAsyncHandlers = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};
const createIo = () => {
    const emit = vitest_1.vi.fn();
    const to = vitest_1.vi.fn(() => ({ emit }));
    return {
        emit,
        to,
    };
};
(0, vitest_1.describe)('registerNotificationHandler', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('creates and emits an application notification for the job creator', async () => {
        const io = createIo();
        getSocketServer.mockReturnValue(io);
        findById.mockReturnValue({
            select: vitest_1.vi.fn().mockReturnValue({
                lean: vitest_1.vi.fn().mockResolvedValue({ createdBy: 'hr-1' }),
            }),
        });
        createNotification.mockResolvedValue({
            _id: 'notification-1',
            userId: 'hr-1',
            message: 'created',
            type: 'APPLICATION',
            isRead: false,
            metadata: {
                applicationId: 'application-1',
                jobId: 'job-1',
                candidateId: 'candidate-1',
            },
            createdAt: new Date('2026-03-29T10:00:00.000Z'),
        });
        const { registerNotificationHandler } = await Promise.resolve().then(() => __importStar(require('../../../src/services/notification/notification.handler')));
        const { emitApplicationCreated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/eventBus')));
        registerNotificationHandler();
        emitApplicationCreated({
            applicationId: 'application-1',
            jobId: 'job-1',
            candidateId: 'candidate-1',
            candidateName: 'Ava Candidate',
            jobTitle: 'Frontend Developer',
        });
        await flushAsyncHandlers();
        (0, vitest_1.expect)(createNotification).toHaveBeenCalledWith({
            userId: 'hr-1',
            message: 'Ava Candidate applied for Frontend Developer.',
            type: 'APPLICATION',
            metadata: {
                applicationId: 'application-1',
                jobId: 'job-1',
                candidateId: 'candidate-1',
            },
        });
        (0, vitest_1.expect)(io.to).toHaveBeenCalledWith('user:hr-1');
        (0, vitest_1.expect)(io.emit).toHaveBeenCalledWith('notification', vitest_1.expect.objectContaining({ _id: 'notification-1' }));
    });
    (0, vitest_1.it)('skips application notifications when the job creator cannot be resolved', async () => {
        findById.mockReturnValue({
            select: vitest_1.vi.fn().mockReturnValue({
                lean: vitest_1.vi.fn().mockResolvedValue(null),
            }),
        });
        const { registerNotificationHandler } = await Promise.resolve().then(() => __importStar(require('../../../src/services/notification/notification.handler')));
        const { emitApplicationCreated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/eventBus')));
        registerNotificationHandler();
        emitApplicationCreated({
            applicationId: 'application-2',
            jobId: 'job-2',
            candidateId: 'candidate-2',
            candidateName: 'No Owner',
            jobTitle: 'Backend Developer',
        });
        await flushAsyncHandlers();
        (0, vitest_1.expect)(createNotification).not.toHaveBeenCalled();
        (0, vitest_1.expect)(getSocketServer).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('creates a status notification for the candidate', async () => {
        const io = createIo();
        getSocketServer.mockReturnValue(io);
        createNotification.mockResolvedValue({
            _id: 'notification-2',
            userId: 'candidate-4',
            message: 'status changed',
            type: 'STATUS',
            isRead: false,
            metadata: {
                applicationId: 'application-4',
                status: 'SHORTLISTED',
            },
            createdAt: new Date('2026-03-29T11:00:00.000Z'),
        });
        const { registerNotificationHandler } = await Promise.resolve().then(() => __importStar(require('../../../src/services/notification/notification.handler')));
        const { emitApplicationStatusUpdated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/eventBus')));
        registerNotificationHandler();
        emitApplicationStatusUpdated({
            applicationId: 'application-4',
            candidateId: 'candidate-4',
            jobTitle: 'QA Engineer',
            status: 'SHORTLISTED',
        });
        await flushAsyncHandlers();
        (0, vitest_1.expect)(createNotification).toHaveBeenCalledWith({
            userId: 'candidate-4',
            message: 'Your application for QA Engineer was updated to SHORTLISTED.',
            type: 'STATUS',
            metadata: {
                applicationId: 'application-4',
                status: 'SHORTLISTED',
            },
        });
        (0, vitest_1.expect)(io.to).toHaveBeenCalledWith('user:candidate-4');
    });
    (0, vitest_1.it)('creates interview notifications for both candidate and interviewer', async () => {
        const io = createIo();
        getSocketServer.mockReturnValue(io);
        createNotification
            .mockResolvedValueOnce({
            _id: 'notification-3',
            userId: 'candidate-5',
            message: 'candidate notice',
            type: 'INTERVIEW',
            isRead: false,
            metadata: {
                interviewId: 'interview-1',
                applicationId: 'application-5',
            },
            createdAt: new Date('2026-03-29T12:00:00.000Z'),
        })
            .mockResolvedValueOnce({
            _id: 'notification-4',
            userId: 'interviewer-5',
            message: 'interviewer notice',
            type: 'INTERVIEW',
            isRead: false,
            metadata: {
                interviewId: 'interview-1',
                applicationId: 'application-5',
            },
            createdAt: new Date('2026-03-29T12:00:01.000Z'),
        });
        const { registerNotificationHandler } = await Promise.resolve().then(() => __importStar(require('../../../src/services/notification/notification.handler')));
        const { emitInterviewUpdated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/eventBus')));
        registerNotificationHandler();
        emitInterviewUpdated({
            interviewId: 'interview-1',
            applicationId: 'application-5',
            candidateId: 'candidate-5',
            interviewerId: 'interviewer-5',
            candidateName: 'Priya',
            jobTitle: 'Product Designer',
            interviewDate: '2026-04-02',
            interviewTime: '10:30 AM',
        });
        await flushAsyncHandlers();
        (0, vitest_1.expect)(createNotification).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(createNotification).toHaveBeenNthCalledWith(1, {
            userId: 'candidate-5',
            message: 'Interview scheduled for Product Designer on 2026-04-02 at 10:30 AM.',
            type: 'INTERVIEW',
            metadata: {
                interviewId: 'interview-1',
                applicationId: 'application-5',
            },
        });
        (0, vitest_1.expect)(createNotification).toHaveBeenNthCalledWith(2, {
            userId: 'interviewer-5',
            message: 'Interview assigned with Priya for Product Designer on 2026-04-02 at 10:30 AM.',
            type: 'INTERVIEW',
            metadata: {
                interviewId: 'interview-1',
                applicationId: 'application-5',
            },
        });
        (0, vitest_1.expect)(io.to).toHaveBeenNthCalledWith(1, 'user:candidate-5');
        (0, vitest_1.expect)(io.to).toHaveBeenNthCalledWith(2, 'user:interviewer-5');
    });
    (0, vitest_1.it)('registers notification listeners only once', async () => {
        const io = createIo();
        getSocketServer.mockReturnValue(io);
        createNotification.mockResolvedValue({
            _id: 'notification-5',
            userId: 'candidate-6',
            message: 'status changed',
            type: 'STATUS',
            isRead: false,
            metadata: {
                applicationId: 'application-6',
                status: 'HIRED',
            },
            createdAt: new Date('2026-03-29T13:00:00.000Z'),
        });
        const { registerNotificationHandler } = await Promise.resolve().then(() => __importStar(require('../../../src/services/notification/notification.handler')));
        const { emitApplicationStatusUpdated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/eventBus')));
        registerNotificationHandler();
        registerNotificationHandler();
        emitApplicationStatusUpdated({
            applicationId: 'application-6',
            candidateId: 'candidate-6',
            jobTitle: 'DevOps Engineer',
            status: 'HIRED',
        });
        await flushAsyncHandlers();
        (0, vitest_1.expect)(createNotification).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(io.to).toHaveBeenCalledTimes(1);
    });
});
