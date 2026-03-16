export const JOB_EXPERIENCE_LEVELS = ["0", "1-3", "3-7", "7+"] as const;
export type JobExperienceLevel = (typeof JOB_EXPERIENCE_LEVELS)[number];

export interface CreateJobRequestBody {
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: JobExperienceLevel;
}

export interface UpdateJobRequestBody {
  title?: string;
  description?: string;
  requiredSkills?: string;
  experienceLevel?: JobExperienceLevel;
}

export interface JobListQuery {
  search?: string;
  requiredSkills?: string;
  experienceLevel?: string;
  isActive?: string;
  page?: string;
  limit?: string;
}

export type PaginationResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
