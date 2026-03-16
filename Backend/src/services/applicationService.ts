import { Types } from "mongoose";
import { FeedbackModel } from "../models/feedbackModel";
import { InterviewModel, INTERVIEW_STATUSES } from "../models/interviewModel";
import { ApplicationModel } from "../models/applicationModel";
import { JobModel } from "../models/jobModel";
import { UserModel } from "../models/userModel";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import {
  assertEntityExists,
  normalizeStatusValue,
  requireTrimmedValue,
  resolveInterviewFeedbackStatus,
  toIdString,
  trimOrEmpty,
  trimValue,
} from "../utils/helpers";
import { sendApplicationStatusEmail, sendInterviewInviteEmails } from "../utils/helpers/emailHelper";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type ScheduleInterviewInput,
  type InterviewerUser,
  type PopulatedJob,
  type PopulatedApplication,
  type HrInterviewLean,
  type CandidateInterviewLean,
  type InterviewerInterviewLean,
  type CandidateInterviewResult,
  type InterviewerInterviewResult,
  PopulatedCandidate,
} from "../utils/types";
import { ensureCandidateInterviewerConversation } from "./chatService";
import { createGoogleMeetEvent } from "./googleMeetService";

const normalizeStatus = (status: string): ApplicationStatus => {
  const normalizedStatus = normalizeStatusValue(status);

  if (!(APPLICATION_STATUSES as readonly string[]).includes(normalizedStatus)) {
    throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.INVALID_STATUS,APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  return normalizedStatus as ApplicationStatus;
};

const getHrAccessibleApplication = async (applicationId: string, _hrUserId: string) => {
  const application = await ApplicationModel.findById(applicationId);
  assertEntityExists(application, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);

  const job = await JobModel.findById(application.jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  return { application, job };
};

const toInterviewDateTimeIso = (interviewDate: string, interviewTime: string): { startDateTime: string; endDateTime: string } => {
  const start = new Date(`${interviewDate}T${interviewTime}:00+05:30`);
  if (Number.isNaN(start.getTime())) {
    throw new ApplicationError(APPLICATION_MESSAGES.INTERVIEW.INVALID_DATE_TIME, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
};

export const updateApplicationStatus = async (
  applicationId: string,
  hrUserId: string,
  status: string
) => {
  const normalizedStatus = normalizeStatus(status);
  const { application, job } = await getHrAccessibleApplication(applicationId, hrUserId);
  const activeScheduledInterview = await InterviewModel.findOne({
    applicationId: application._id,
    status: INTERVIEW_STATUSES[0],
  });

  if (activeScheduledInterview && normalizedStatus !== APPLICATION_STATUSES[2]) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.CANCEL_INTERVIEW_BEFORE_STATUS_CHANGE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (application.status === APPLICATION_STATUSES[3] && normalizedStatus !== APPLICATION_STATUSES[3]) {
    throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.HIRED_STATUS_LOCKED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (application.status === APPLICATION_STATUSES[4] && normalizedStatus !== APPLICATION_STATUSES[4]) {
    throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.REJECTED_STATUS_LOCKED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const candidate = await UserModel.findById(application.candidateId).select("name email");
  assertEntityExists(candidate, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND);

  if (normalizedStatus === APPLICATION_STATUSES[3] || normalizedStatus === APPLICATION_STATUSES[4]) {
    const interview = await InterviewModel.findOne({ applicationId: application._id });
    assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND_FOR_APPLICATION);

    const feedback = await FeedbackModel.findOne({ interviewId: interview._id });
    if (!feedback) {
      throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.FEEDBACK_REQUIRED_FOR_FINAL_DECISION, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
    }

    if (interview.feedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0]) {
      throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.FEEDBACK_REVIEW_PENDING, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
    }

    interview.feedbackStatus = APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2];
    await interview.save();
  }

  application.status = normalizedStatus;
  await application.save();

  if (
    normalizedStatus === APPLICATION_STATUSES[1] ||
    normalizedStatus === APPLICATION_STATUSES[4] ||
    normalizedStatus === APPLICATION_STATUSES[3] ||
    normalizedStatus === APPLICATION_STATUSES[2]
  ) {
    try {
      if (candidate.email) {
        await sendApplicationStatusEmail(candidate.email, candidate.name, job.title, normalizedStatus);
      }
    } catch (_error) {
    }
  }

  return application;
};

export const scheduleApplicationInterview = async (
  applicationId: string,
  hrUserId: string,
  payload: ScheduleInterviewInput
) => {
  const interviewDate = requireTrimmedValue(
    payload.interviewDate,
    APPLICATION_MESSAGES.INTERVIEW.DATE_TIME_REQUIRED
  );
  const interviewTime = requireTrimmedValue(
    payload.interviewTime,
    APPLICATION_MESSAGES.INTERVIEW.DATE_TIME_REQUIRED
  );

  const { application, job } = await getHrAccessibleApplication(applicationId, hrUserId);
  const candidate = await UserModel.findById(application.candidateId).select("name email");
  assertEntityExists(candidate, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND);

  let interviewer: InterviewerUser | null = null;
  if (trimValue(payload.interviewerId)) {
    const interviewerById = await UserModel.findById(trimValue(payload.interviewerId)).select("_id name email role");
    if (interviewerById?.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
      interviewer = {
        _id: interviewerById._id as Types.ObjectId,
        name: interviewerById.name,
        email: interviewerById.email,
        role: interviewerById.role,
      };
    }
  } else if (trimValue(payload.interviewerName)) {
    const interviewerByName = await UserModel.findOne({
      role: APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER,
      name: trimValue(payload.interviewerName),
    }).select("_id name email role");
    if (interviewerByName) {
      interviewer = {
        _id: interviewerByName._id as Types.ObjectId,
        name: interviewerByName.name,
        email: interviewerByName.email,
        role: interviewerByName.role,
      };
    }
  }

  if (!interviewer) {
    throw new ApplicationError(APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_REQUIRED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const { startDateTime, endDateTime } = toInterviewDateTimeIso(interviewDate, interviewTime);
  const meetingLink = await createGoogleMeetEvent({
    summary: `Interview - ${job.title}`,
    description: trimValue(payload.notes) || APPLICATION_CONSTANTS.INTERVIEW.DEFAULT_DESCRIPTION,
    startDateTime,
    endDateTime,
  });

  const interview = await InterviewModel.findOneAndUpdate(
    { applicationId: application._id as Types.ObjectId },
    {
      applicationId: application._id,
      jobId: job._id,
      candidateId: candidate._id,
      interviewerId: interviewer._id,
      interviewerName: interviewer.name,
      interviewDate,
      interviewTime,
      meetingLink,
      notes: trimOrEmpty(payload.notes),
      status: INTERVIEW_STATUSES[0],
      feedbackStatus: APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0],
      createdBy: new Types.ObjectId(hrUserId),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  application.status = APPLICATION_STATUSES[2];
  await application.save();
  await ensureCandidateInterviewerConversation(toIdString(candidate._id), toIdString(interviewer._id));

  try {
    if (candidate.email && interviewer.email) {
      await sendInterviewInviteEmails({
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        interviewerEmail: interviewer.email,
        interviewerName: interviewer.name,
        jobTitle: job.title,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime,
        meetingLink: interview.meetingLink,
        startDateTimeIso: startDateTime,
        endDateTimeIso: endDateTime,
        notes: trimOrEmpty(interview.notes),
      });
    }
  } catch (_error) {
  }

  return interview;
};

export const scheduleInterviewByHr = async (hrUserId: string, payload: ScheduleInterviewInput & { applicationId: string }) => {
  return scheduleApplicationInterview(payload.applicationId, hrUserId, payload);
};

export const cancelInterviewByHr = async (interviewId: string, _hrUserId: string) => {
  const interview = await InterviewModel.findById(interviewId);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  if (interview.status !== INTERVIEW_STATUSES[0]) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.INTERVIEW.ONLY_SCHEDULED_CAN_BE_CANCELLED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  interview.status = INTERVIEW_STATUSES[2];
  await interview.save();

  const application = await ApplicationModel.findById(interview.applicationId);
  assertEntityExists(application, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);

  if (application.status === APPLICATION_STATUSES[2]) {
    application.status = APPLICATION_STATUSES[1];
    await application.save();
  }

  return interview;
};

const pad = (value: number): string => String(value).padStart(2, "0");

const generateDailySlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = APPLICATION_CONSTANTS.INTERVIEW.WORKDAY_START_HOUR; hour < APPLICATION_CONSTANTS.INTERVIEW.WORKDAY_END_HOUR; hour += 1) {
    slots.push(`${pad(hour)}:00`);
    slots.push(`${pad(hour)}:${pad(APPLICATION_CONSTANTS.INTERVIEW.SLOT_INTERVAL_MINUTES)}`);
  }
  return slots;
};

export const getInterviewerAvailabilityForDate = async (
  interviewerId: string,
  interviewDate: string
) => {
  if (!trimValue(interviewerId) || !trimValue(interviewDate)) {
    throw new ApplicationError(APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_ID_AND_DATE_REQUIRED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const interviewer = await UserModel.findById(interviewerId).select("role");
  if (!interviewer || interviewer.role !== APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    throw new ApplicationError(APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  const bookedInterviews = await InterviewModel.find({
    interviewerId: interviewer._id,
    interviewDate,
    status: INTERVIEW_STATUSES[0],
  })
    .select("interviewTime")
    .lean();

  const bookedTimes = new Set(bookedInterviews.map((interview) => interview.interviewTime));
  return generateDailySlots().map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));
};

export const getHrInterviews = async (_hrUserId: string) => {
  const interviews = await InterviewModel.find()
    .populate("candidateId", "name email")
    .populate("jobId", "title")
    .populate("applicationId", "status")
    .sort({ interviewDate: 1, interviewTime: 1 })
    .lean<HrInterviewLean[]>();

  return interviews.map((interview) => {
    const candidate =
      typeof interview.candidateId === "object" && interview.candidateId !== null && "_id" in interview.candidateId
        ? (interview.candidateId as PopulatedCandidate)
        : null;
    const job =
      typeof interview.jobId === "object" && interview.jobId !== null && "_id" in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const application =
      typeof interview.applicationId === "object" && interview.applicationId !== null
        ? (interview.applicationId as PopulatedApplication)
        : null;

    return {
      _id: interview._id,
      applicationId: toIdString(application?._id) || toIdString(interview.applicationId),
      applicationStatus: application?.status ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      candidate: {
        _id: toIdString(candidate?._id),
        name: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        email: candidate?.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(
        interview.feedbackStatus,
        interview.status,
        application?.status
      ),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};

const resolveCandidateInterviewResult = (applicationStatus: string | undefined): CandidateInterviewResult => {
  const normalized = (applicationStatus ?? APPLICATION_CONSTANTS.EMPTY_STRING).toUpperCase();
  if (normalized === APPLICATION_STATUSES[3]) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PASSED;
  }
  if (normalized === APPLICATION_STATUSES[4]) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.FAILED;
  }
  return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PENDING;
};

export const getCandidateInterviews = async (candidateUserId: string) => {
  const interviews = await InterviewModel.find({ candidateId: candidateUserId })
    .populate("jobId", "title")
    .populate("applicationId", "status")
    .sort({ interviewDate: -1, interviewTime: -1 })
    .lean<CandidateInterviewLean[]>();

  return interviews.map((interview) => {
    const job =
      typeof interview.jobId === "object" && interview.jobId !== null && "_id" in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const application =
      typeof interview.applicationId === "object" && interview.applicationId !== null
        ? (interview.applicationId as { status?: string })
        : null;

    return {
      _id: interview._id,
      applicationId: interview.applicationId,
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(
        interview.feedbackStatus,
        interview.status,
        application?.status
      ),
      result: resolveCandidateInterviewResult(application?.status),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};

const resolveInterviewerInterviewResult = (interviewStatus: string | undefined): InterviewerInterviewResult => {
  const normalized = (interviewStatus ?? APPLICATION_CONSTANTS.EMPTY_STRING).toUpperCase();
  if (normalized === INTERVIEW_STATUSES[1]) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PASSED;
  }
  if (normalized === INTERVIEW_STATUSES[2]) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.FAILED;
  }
  return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PENDING;
};

export const getInterviewerInterviews = async (interviewerUserId: string) => {
  const interviews = await InterviewModel.find({ interviewerId: interviewerUserId })
    .populate("jobId", "title")
    .populate("candidateId", "name email")
    .sort({ interviewDate: -1, interviewTime: -1 })
    .lean<InterviewerInterviewLean[]>();

  return interviews.map((interview) => {
    const job =
      typeof interview.jobId === "object" && interview.jobId !== null && "_id" in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const candidate =
      typeof interview.candidateId === "object" && interview.candidateId !== null && "_id" in interview.candidateId
        ? (interview.candidateId as PopulatedCandidate)
        : null;

    return {
      _id: interview._id,
      applicationId: interview.applicationId,
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      candidate: {
        _id: toIdString(candidate?._id),
        name: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        email: candidate?.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(interview.feedbackStatus, interview.status),
      result: resolveInterviewerInterviewResult(interview.status),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};
