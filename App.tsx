import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Tab, ViewMode } from './types';
import { CandidatesTab } from './components/tabs/CandidatesTab';
import { QualityAndEthicsTab } from './components/tabs/QualityAndEthicsTab';
import { JobRequisitionsTab } from './components/tabs/JobRequisitionsTab';
import { PipelineAndInterviewsTab } from './components/tabs/PipelineAndInterviewsTab';
import { CandidateExperienceTab } from './components/tabs/CandidateExperienceTab';
import { ProactiveSourcingTab } from './components/tabs/ProactiveSourcingTab';
import { OfferManagementTab } from './components/tabs/OfferManagementTab';
import { OnboardingTab } from './components/tabs/OnboardingTab';
import { TeamAndCommunityTab } from './components/tabs/TeamAndCommunityTab';
import { AnalyticsAndComplianceTab } from './components/tabs/AnalyticsAndComplianceTab';
import { AutomationAndIntegrationsTab } from './components/tabs/AutomationAndIntegrationsTab';
import { OperationalDashboardTab } from './components/tabs/OperationalDashboardTab';
import { TABS } from './constants';
import { HiringManagerDashboardTab } from './components/tabs/HiringManagerDashboardTab';
import { EmployeeReferralsTab } from './components/tabs/EmployeeReferralsTab';
import { InternalMobilityTab } from './components/tabs/InternalMobilityTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [currentView, setCurrentView] = useState<ViewMode>('recruiter');
  
  // Use stable users for the demo to ensure data is available for the manager.
  const recruiterUser = 'Taylor Kim';
  const managerUser = 'Jordan Lee';
  const currentUser = useMemo(() => (currentView === 'recruiter' ? recruiterUser : managerUser), [currentView]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case Tab.Dashboard:
        return currentView === 'recruiter' 
          ? <OperationalDashboardTab /> 
          : <HiringManagerDashboardTab currentUser={currentUser} setActiveTab={setActiveTab} />;
      case Tab.Candidates:
        return <CandidatesTab currentView={currentView} currentUser={currentUser} />;
      case Tab.InsightJudgment:
        return <QualityAndEthicsTab />;
      case Tab.JobRequisitions:
        return <JobRequisitionsTab currentView={currentView} currentUser={currentUser} />;
      case Tab.CandidatePipeline:
        return <PipelineAndInterviewsTab currentView={currentView} currentUser={currentUser} />;
      case Tab.CandidateExperience:
        return <CandidateExperienceTab currentView={currentView} currentUser={currentUser} />;
      case Tab.ProactiveSourcing:
        return <ProactiveSourcingTab />;
      case Tab.OfferManagement:
        return <OfferManagementTab />;
      case Tab.Onboarding:
        return <OnboardingTab />;
      case Tab.EmployeeReferrals:
        return <EmployeeReferralsTab />;
      case Tab.InternalMobility:
        return <InternalMobilityTab />;
      case Tab.PerformanceCreativity:
        return <TeamAndCommunityTab />;
      case Tab.PredictiveAnalytics:
        return <AnalyticsAndComplianceTab />;
      case Tab.IntegrationUpskilling:
        return <AutomationAndIntegrationsTab />;
      default:
        const tabInfo = TABS.find(t => t.id === activeTab);
        return <div>{tabInfo?.name || 'Unknown'} tab is not implemented.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentView={currentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setActiveTab={setActiveTab}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default App;
