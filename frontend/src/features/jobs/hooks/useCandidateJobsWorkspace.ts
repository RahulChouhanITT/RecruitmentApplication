import { useEffect, useState } from "react";
import { JOBS_UI_TEXT } from "../labels/jobLabels";
import type { CandidateJobsWorkspaceProps, CandidateJobsWorkspaceTab } from "../types/jobTypes";

export const CANDIDATE_WORKSPACE_TABS: Array<{ id: CandidateJobsWorkspaceTab; label: string }> = [
  { id: "open-jobs", label: JOBS_UI_TEXT.OPEN_JOBS_TITLE },
  { id: "my-applications", label: JOBS_UI_TEXT.MY_APPLICATIONS_TITLE },
  { id: "interviews", label: "Interviews" },
];

export const useCandidateJobsWorkspace = ({ initialTab = "open-jobs" }: CandidateJobsWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<CandidateJobsWorkspaceTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return {
    activeTab,
    setActiveTab,
    tabs: CANDIDATE_WORKSPACE_TABS,
  };
};
