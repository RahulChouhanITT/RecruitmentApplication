import { InterviewsPage } from '../../pages/InterviewsPage/InterviewsPage';
import { MyApplicationsPage } from '../../pages/MyApplicationsPage/MyApplicationsPage';
import { OpenJobsPage } from '../../pages/OpenJobsPage/OpenJobsPage';
import { useCandidateJobsWorkspace } from '../../hooks/useCandidateJobsWorkspace';
import type { CandidateJobsWorkspaceProps } from '../../types/jobTypes';
import { TabButton, Tabs, Wrap } from './CandidateJobsWorkspace.styles';

export const CandidateJobsWorkspace = ({
  initialTab = 'open-jobs',
}: CandidateJobsWorkspaceProps) => {
  const { activeTab, setActiveTab, tabs } = useCandidateJobsWorkspace({ initialTab });

  return (
    <Wrap>
      <Tabs>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            type="button"
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </Tabs>

      {activeTab === 'open-jobs' ? <OpenJobsPage /> : null}
      {activeTab === 'my-applications' ? <MyApplicationsPage /> : null}
      {activeTab === 'interviews' ? <InterviewsPage /> : null}
    </Wrap>
  );
};
