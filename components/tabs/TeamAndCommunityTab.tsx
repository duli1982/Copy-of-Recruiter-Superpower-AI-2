import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { JobRequisition, Candidate, PipelineStage, SourcingStrategy, BooleanSearchQuery, CommunityPrompt, Tab } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA, MOCK_COMMUNITY_PROMPTS, TABS } from '../../constants';
import { generateSourcingStrategy, refineSourcingStrategy } from '../../services/geminiService';

// --- STORAGE KEYS ---
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const PIPELINE_STORAGE_KEY = 'recruiter-ai-pipeline';
const PROMPTS_STORAGE_KEY = 'recruiter-ai-community-prompts';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

// --- ICONS ---
const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;


// --- HELPER FUNCTIONS ---
const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};


export const TeamAndCommunityTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'performance' | 'community'>('performance');

    // Performance State
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [candidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [pipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));

    // Community State
    const [prompts, setPrompts] = useState<CommunityPrompt[]>(() => getInitialData(PROMPTS_STORAGE_KEY, MOCK_COMMUNITY_PROMPTS));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- COMPUTED VALUES ---
    const performanceMetrics = useMemo(() => {
        // ... (Logic from PerformanceCreativityTab)
        return { totalHires: 0, avgTimeToFill: 'N/A', conversionRate: 'N/A', sourceEffectiveness: [] };
    }, [requisitions, pipelineData, candidates]);

    const filteredPrompts = useMemo(() => {
        // ... (Logic from AdoptionCommunityTab)
        return prompts;
    }, [prompts, searchQuery]);

    // --- HANDLERS ---
    const handleSavePrompt = (newPrompt: Omit<CommunityPrompt, 'id'>) => {
        const newId = prompts.length > 0 ? Math.max(...prompts.map(p => p.id)) + 1 : 1;
        setPrompts(prev => [{id: newId, ...newPrompt}, ...prev]);
        setIsModalOpen(false);
    };

    // --- RENDER METHODS ---

    const renderPerformance = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader title="Key Performance Indicators" icon={<BarChartIcon />} />
                    {/* ... KPI content ... */}
                </Card>
                <Card>
                    <CardHeader title="Source of Hire" />
                    {/* ... Source of Hire content ... */}
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader title="AI Sourcing Strategist" description="Generate powerful boolean search strings and discover untapped talent pools." icon={<LightbulbIcon />} />
                    {/* ... Sourcing Strategist content ... */}
                </Card>
            </div>
        </div>
    );

    const renderCommunity = () => (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader title="Hiring Manager Training" />
                     {/* ... Training content ... */}
                </Card>
                <Card>
                    <CardHeader title="Recruiting Realities This App Ignores" />
                     {/* ... Realities content ... */}
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                     <div className="flex flex-wrap gap-4 justify-between items-center">
                        <CardHeader title="Community Prompt Library" />
                        <div className="flex gap-4 items-center">
                            <input type="search" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field-sm" />
                            <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} className="!text-xs !py-1 !px-2">Share</Button>
                        </div>
                    </div>
                    <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                       {/* ... Prompt list ... */}
                    </div>
                </Card>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Team & Community</h2>
                 <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('performance')} className={`${activeTab === 'performance' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>Team Performance</button>
                        <button onClick={() => setActiveTab('community')} className={`${activeTab === 'community' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>Adoption & Community</button>
                    </nav>
                </div>
            </div>

            {activeTab === 'performance' && renderPerformance()}
            {activeTab === 'community' && renderCommunity()}

            {/* ... Modal ... */}

            <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-weight: 500; color: #9ca3af; } .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }`}</style>
        </div>
    );
};