export const PROFILE_FORM_LIMITS = {
  maxSkillsLength: 250,
  maxLocationLength: 120,
  phoneDigits: 10,
  maxExperienceYears: 50,
  resumeMaxSizeBytes: 5 * 1024 * 1024,
} as const;

export const PROFILE_RESUME_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const PROFILE_RESUME_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export const PROFILE_INITIAL_VALUES = {
  EMPTY_STRING: "",
  AVATAR_FALLBACK: "U",
  DISPLAY_FALLBACK: "-",
  COMPLETE_PROFILE_PAYLOAD: {
    phone: "",
    resumeUrl: "",
    skills: "",
    experienceYears: 0,
    currentLocation: "",
    position: "",
    experienceLevel: "",
    department: "",
    techStack: "",
  },
  UPDATE_PROFILE_PAYLOAD: {
    name: "",
  },
} as const;
