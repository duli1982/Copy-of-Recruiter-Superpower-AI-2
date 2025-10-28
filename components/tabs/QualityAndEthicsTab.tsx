import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { auditJobDescription, rankCandidates } from '../../services/geminiService';
import { MOCK_BIASED_JOB_DESCRIPTION, MOCK_JOB_REQUISITIONS, MOCK_EEO_DATA, PIPELINE_STAGES, MOCK_CANDIDATES } from '../../constants';
import { BiasAuditReport, JobRequisition, PipelineStage, RankedCandidate } from '../../types';

// --- ICONS ---
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

// --- STORAGE KEYS ---
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';

// --- HELPER FUNCTIONS ---
const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

export const QualityAndEthicsTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'matchmaking' | 'bias_auditor' | 'eeo'>('matchmaking');

    // Shared State
    const [jobRequisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(jobRequisitions[0]?.id);
    const [jobDescription, setJobDescription] = useState(jobRequisitions[0]?.description || '');

    // Matchmaking State
    const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[] | null>(null);
    const [isRanking, setIsRanking] = useState(false);
    const [rankingError, setRankingError] = useState('');

    // Bias Auditor State
    const [auditReport, setAuditReport] = useState<BiasAuditReport | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditError, setAuditError] = useState('');

    useEffect(() => {
        const selectedJob = jobRequisitions.find(job => job.id === selectedJobId);
        if (selectedJob) {
            setJobDescription(selectedJob.description);
        }
        // Reset results when job changes
        setRankedCandidates(null);
        setAuditReport(null);
    }, [selectedJobId, jobRequisitions]);


    const handleRankCandidates = async () => {
        // ... (Logic from InsightJudgmentTab)
    };

    const handleAudit = async () => {
        // ... (Logic from DiversityEthicsTab)
    };

    // --- RENDER METHODS ---

    const renderMatchmaking = () => (
        <Card>
            <CardHeader title="Matchmaking Oracle" description="Get an AI-powered ranking of candidates based on your job description." icon={<TargetIcon />}/>
            {/* ... Matchmaking UI ... */}
        </Card>
    );

    const renderBiasAuditor = () => (
         <Card>
            <CardHeader title="Bias Auditor Engine" description="Scan job descriptions for exclusionary or biased language." icon={<ShieldCheckIcon />}/>
            {/* ... Bias Auditor UI ... */}
        </Card>
    );

    const renderEEO = () => (
        <Card>
            <CardHeader title="EEO Analytics" description="Analyze demographic breakdown at each stage of the hiring pipeline." icon={<UsersIcon />}/>
            {/* ... EEO Analytics UI ... */}
        </Card>
    );

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Quality & Ethics</h2>
                 <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('matchmaking')} className={`${activeTab === 'matchmaking' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>AI Matchmaking</button>
                        <button onClick={() => setActiveTab('bias_auditor')} className={`${activeTab === 'bias_auditor' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>Bias Auditor</button>
                        <button onClick={() => setActiveTab('eeo')} className={`${activeTab === 'eeo' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>EEO Analytics</button>
                    </nav>
                </div>
            </div>

            {activeTab === 'matchmaking' && renderMatchmaking()}
            {activeTab === 'bias_auditor' && renderBiasAuditor()}
            {activeTab === 'eeo' && renderEEO()}
        </div>
    );
};