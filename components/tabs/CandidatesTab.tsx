import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    Candidate, TagType, AIGroupAnalysisReport, CandidateStatus, ApplicationHistory, RelationshipStatus, CandidateCRM, Touchpoint, TouchpointType, NurtureCadence, NurtureContentType, Attachment, ComplianceInfo, Interview, JobRequisition, OverallRecommendation, ViewMode, PipelineStage, EmailTemplateType, SentEmail, EmailStatus, EmailSequence
} from '../../types';
import { MOCK_CANDIDATES, MOCK_SCHEDULED_INTERVIEWS, MOCK_JOB_REQUISITIONS, MOCK_PIPELINE_DATA, MOCK_SENT_EMAILS, MOCK_SEQUENCES } from '../../constants';
import { analyzeCandidateGroup, getCRMSuggestion, generateEmail, parseResume } from '../../services/geminiService';
import { Spinner } from '../ui/Spinner';

// Icons (A consolidated list from both files)
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L8 8l-5 2 5 2 2 5 2-5 5-2-5-2-2-5zM18 13l-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5-1.5-3z"/></svg>;
const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const History = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;
const TestTube = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h-3c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;

// --- STORAGE KEYS ---
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const SAVED_SEARCHES_KEY = 'recruiter-ai-saved-searches';
const INTERVIEWS_KEY = 'recruiter-ai-interviews';
const REQUISITIONS_KEY = 'recruiter-ai-requisitions';
const PIPELINE_KEY = 'recruiter-ai-pipeline';
const SENT_EMAILS_STORAGE_KEY = 'recruiter-ai-sent-emails';
const SEQUENCES_STORAGE_KEY = 'recruiter-ai-sequences';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

interface CandidatesTabProps {
  currentView: ViewMode;
  currentUser: string;
}

interface Filters {
    searchQuery: string;
    skills: string;
    location: string;
    minExperience: number;
    maxExperience: number;
    tag: string;
    status: string;
    source: string;
    visaStatus: string;
    relationshipStatus: RelationshipStatus | 'All';
}

interface SavedSearch {
    name: string;
    filters: Filters;
}

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

// --- CONSTANTS & HELPERS ---
const BLANK_FILTERS: Filters = { searchQuery: '', skills: '', location: '', minExperience: 0, maxExperience: 20, tag: 'All', status: 'All', source: '', visaStatus: '', relationshipStatus: 'All' };
const BLANK_CRM: CandidateCRM = { relationshipStatus: 'Cold', relationshipScore: 10, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Monthly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false }};
const BLANK_CANDIDATE: Omit<Candidate, 'id'> = { name: '', email: '', phone: '', skills: '', resumeSummary: '', experience: 0, location: '', availability: 'Immediate', tags: [], status: CandidateStatus.Passive, lastContactDate: '', source: '', compensation: { currentSalary: 0, salaryExpectation: 0, negotiationNotes: ''}, visaStatus: '', applicationHistory: [], crm: BLANK_CRM, attachments: [], compliance: { consentStatus: 'Not Requested' } };

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center">
        <button type="button" className={`${checked ? 'bg-indigo-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
            <span aria-hidden="true" className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
        <span className="ml-3 text-sm font-medium text-gray-300">{label}</span>
    </div>
);

const EmailStatusBadge: React.FC<{ status: EmailStatus }> = ({ status }) => {
    const styles: Record<EmailStatus, string> = {
        [EmailStatus.Sent]: 'bg-blue-500/20 text-blue-300',
        [EmailStatus.Opened]: 'bg-purple-500/20 text-purple-300',
        [EmailStatus.Clicked]: 'bg-yellow-500/20 text-yellow-300',
        [EmailStatus.Replied]: 'bg-green-500/20 text-green-300',
        [EmailStatus.Bounced]: 'bg-red-500/20 text-red-300',
        [EmailStatus.Draft]: 'bg-gray-600/20 text-gray-300',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};

export const CandidatesTab: React.FC<CandidatesTabProps> = ({ currentView, currentUser }) => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'profiles' | 'ai_composer' | 'analytics'>('profiles');

    // Candidate Profiles State
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [interviews] = useState<Interview[]>(() => getInitialData(INTERVIEWS_KEY, MOCK_SCHEDULED_INTERVIEWS));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_KEY, MOCK_PIPELINE_DATA));
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Candidate, 'id'> | Candidate>(BLANK_CANDIDATE);
    const [filters, setFilters] = useState<Filters>(BLANK_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => getInitialData(SAVED_SEARCHES_KEY, []));
    const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'crm' | 'feedback' | 'documents'>('profile');
    const [multiSelectIds, setMultiSelectIds] = useState<Set<number>>(new Set());
    const [targetJobTitle, setTargetJobTitle] = useState('Senior Frontend Engineer');
    const [summaryReport, setSummaryReport] = useState<AIGroupAnalysisReport | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');
    const [crmSuggestion, setCrmSuggestion] = useState<{suggestion: string, nextStep: string} | null>(null);
    const [isGeneratingCrmSuggestion, setIsGeneratingCrmSuggestion] = useState(false);
    const [newActivity, setNewActivity] = useState({ type: 'Note' as TouchpointType, notes: '' });
    const [showResumeParser, setShowResumeParser] = useState(false);

    // AI Assistant State
    const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => getInitialData(SENT_EMAILS_STORAGE_KEY, MOCK_SENT_EMAILS));
    const [sequences, setSequences] = useState<EmailSequence[]>(() => getInitialData(SEQUENCES_STORAGE_KEY, MOCK_SEQUENCES));
    const [composerCandidateId, setComposerCandidateId] = useState<string>('');
    const [composerJobTitle, setComposerJobTitle] = useState('Senior Product Manager');
    const [keyPoints, setKeyPoints] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(EmailTemplateType.Rejection);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [isABTesting, setIsABTesting] = useState(false);
    const [subjectA, setSubjectA] = useState('');
    const [subjectB, setSubjectB] = useState('');

    // --- EFFECTS ---
    useEffect(() => {
        if (currentView === 'recruiter') {
            localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidates));
        }
    }, [candidates, currentView]);

    useEffect(() => {
        if (currentView === 'recruiter') {
            localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
        }
    }, [savedSearches, currentView]);

    useEffect(() => {
        localStorage.setItem(SENT_EMAILS_STORAGE_KEY, JSON.stringify(sentEmails));
    }, [sentEmails]);

    useEffect(() => {
        localStorage.setItem(SEQUENCES_STORAGE_KEY, JSON.stringify(sequences));
    }, [sequences]);

    useEffect(() => {
        if (candidates.length > 0 && !composerCandidateId) {
            setComposerCandidateId(String(candidates[0].id));
        }
    }, [candidates, composerCandidateId]);

    useEffect(() => { handleTemplateChange(EmailTemplateType.Rejection); }, []);

    // Effect to simulate email status updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSentEmails(currentEmails => {
                return currentEmails.map(email => {
                    if ([EmailStatus.Replied, EmailStatus.Bounced].includes(email.status)) return email;
                    const random = Math.random();
                    let newStatus = email.status;
                    if (email.status === EmailStatus.Sent && random < 0.1) newStatus = EmailStatus.Opened;
                    else if (email.status === EmailStatus.Opened && random < 0.05) newStatus = EmailStatus.Clicked;
                    else if (email.status === EmailStatus.Clicked && random < 0.02) newStatus = EmailStatus.Replied;
                    return { ...email, status: newStatus };
                });
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);


    // --- COMPUTED VALUES ---
    const filteredCandidates = useMemo(() => {
        // ... (Filtering logic from CandidateProfilesTab)
        return candidates; // Placeholder
    }, [candidates, filters, currentView, currentUser, requisitions, pipelineData, selectedCandidateId]);

    const selectedCandidate = useMemo(() => candidates.find(c => c.id === selectedCandidateId) || null, [selectedCandidateId, candidates]);
    const composerSelectedCandidate = useMemo(() => candidates.find(c => c.id === parseInt(composerCandidateId, 10)), [composerCandidateId, candidates]);

    // --- HANDLERS (Profile Management) ---
    // ... (All handlers from CandidateProfilesTab: handleSelectCandidate, handleAddNew, handleEdit, etc.)
    const handleAddNew = () => {
        if (currentView === 'hiringManager') return;
        setSelectedCandidateId(null);
        setFormState(BLANK_CANDIDATE);
        setIsEditing(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentView === 'hiringManager') return;

        const emailToCheck = (formState as Candidate).email.toLowerCase();
        if ('id' in formState) {
            setCandidates(prev => prev.map(c => c.id === formState.id ? formState as Candidate : c));
        } else {
            const isDuplicate = candidates.some(c => c.email.toLowerCase() === emailToCheck);
            if (isDuplicate && !window.confirm('Email exists. Add anyway?')) return;
            const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
            const newCandidate = { id: newId, ...formState as Omit<Candidate, 'id'> };
            setCandidates(prev => [...prev, newCandidate]);
            setSelectedCandidateId(newId);
        }
        setIsEditing(false);
    };

    const handleAddCandidateFromParser = (formData: Omit<Candidate, 'id'>) => {
        const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
        const newCandidate: Candidate = { id: newId, ...formData, tags: [] };
        const updatedCandidates = [...candidates, newCandidate];
        setCandidates(updatedCandidates);
        setSelectedCandidateId(String(newId));
        setShowResumeParser(false);
        // Maybe show a success message
    };


    // --- HANDLERS (AI Composer) ---
    const handleTemplateChange = (template: EmailTemplateType) => {
        // ... (Logic from AIAssistantTab)
    };
    const handleGenerateEmail = async () => {
        // ... (Logic from AIAssistantTab)
    };
    const handleSendAndTrack = () => {
        // ... (Logic from AIAssistantTab)
    };

    // --- UI COMPONENTS (Reusable) ---
    const StatusBadge: React.FC<{ status: CandidateStatus }> = ({ status }) => {
        const colors = { [CandidateStatus.Active]: 'bg-green-500/20 text-green-300', [CandidateStatus.Passive]: 'bg-blue-500/20 text-blue-300', [CandidateStatus.Interviewing]: 'bg-purple-500/20 text-purple-300', [CandidateStatus.Hired]: 'bg-teal-500/20 text-teal-300', [CandidateStatus.DoNotContact]: 'bg-red-500/20 text-red-300' };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-700 text-gray-300'}`}>{status}</span>;
    };
    const RelationshipStatusBadge: React.FC<{ status: RelationshipStatus }> = ({ status }) => {
        const colors: Record<RelationshipStatus, string> = { 'Hot': 'bg-red-500/20 text-red-300', 'Warm': 'bg-yellow-500/20 text-yellow-300', 'Cold': 'bg-blue-500/20 text-blue-300', 'Silver Medalist': 'bg-teal-500/20 text-teal-300', 'Past Candidate': 'bg-gray-600/20 text-gray-300' };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status]}`}>{status}</span>;
    };

    // --- RENDER METHODS ---

    const renderProfileView = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 h-[80vh] flex flex-col">
                <CardHeader title="Talent Pool" />
                <div className="flex items-center mb-2 gap-2">
                    <input type="text" name="searchQuery" placeholder="Search..." value={filters.searchQuery} className="input-field-sm flex-grow"/>
                    <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<FilterIcon className="h-4 w-4"/>}>{''}</Button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{filteredCandidates.length} of {candidates.length}</span>
                    {currentView === 'recruiter' && (
                        <div className="flex gap-2">
                            <Button onClick={() => setShowResumeParser(true)} variant="secondary" className="!px-2 !py-1 text-xs" icon={<UploadIcon className="h-4 w-4" />}>Parse</Button>
                            <Button onClick={handleAddNew} variant="secondary" className="!px-2 !py-1 text-xs" icon={<PlusIcon className="h-4 w-4" />}>Add New</Button>
                        </div>
                    )}
                </div>
                {/* ... Rest of the candidate list UI from CandidateProfilesTab ... */}
                 <ul className="overflow-y-auto space-y-2 flex-grow">
                        {filteredCandidates.map(c => (
                             <li key={c.id}><div className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${selectedCandidateId === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700/50'}`}>
                                {currentView === 'recruiter' && <input type="checkbox" checked={multiSelectIds.has(c.id)} className="form-checkbox" />}
                                <div className="flex-grow cursor-pointer">
                                    <div className="flex items-center justify-between"><p className="font-semibold truncate">{c.name}</p>{c.crm && <RelationshipStatusBadge status={c.crm.relationshipStatus} />}</div>
                                    <p className={`text-sm truncate ${selectedCandidateId === c.id ? 'text-indigo-200' : 'text-gray-400'}`}>{c.skills}</p>
                                </div>
                            </div></li>
                        ))}
                    </ul>
            </Card>
            <Card className="md:col-span-2 h-[80vh] flex flex-col">
                {/* ... Candidate detail/edit view from CandidateProfilesTab ... */}
                 {!selectedCandidate && !isEditing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-600"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
                           <h3 className="text-lg font-semibold text-gray-300">Select a candidate</h3><p>Choose a candidate from the list to view their profile, or add a new one.</p>
                        </div>
                    ) : null }
            </Card>
        </div>
    );

    const renderComposerView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                 <CardHeader title="AI Email Composer" description="Draft and track personalized emails with AI." icon={<MailIcon />}/>
                <div className="space-y-4 flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="label">Candidate</label><select value={composerCandidateId} onChange={e => setComposerCandidateId(e.target.value)} className="mt-1 input-field" disabled={candidates.length === 0}>{candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label className="label">Template</label><select value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value as EmailTemplateType)} className="mt-1 input-field">{Object.values(EmailTemplateType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    </div>
                    <div><label className="label">Job Title</label><input type="text" value={composerJobTitle} onChange={e => setComposerJobTitle(e.target.value)} className="mt-1 input-field" /></div>
                    <div>
                        <ToggleSwitch checked={isABTesting} onChange={setIsABTesting} label="A/B Test Subject Line" />
                        {isABTesting && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                <input type="text" placeholder="Subject A" value={subjectA} onChange={e => setSubjectA(e.target.value)} className="input-field-sm" />
                                <input type="text" placeholder="Subject B" value={subjectB} onChange={e => setSubjectB(e.target.value)} className="input-field-sm" />
                            </div>
                        )}
                    </div>
                    <div><label className="label">Key Points for AI</label><textarea rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="mt-1 input-field"></textarea></div>
                    <Button onClick={handleGenerateEmail} isLoading={isGeneratingEmail} className="w-full" disabled={!composerCandidateId}>Generate Email Body</Button>
                </div>
                {(isGeneratingEmail || generatedEmail || emailError) && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Email Preview:</h4>
                        {isGeneratingEmail && <Spinner text="Composing..." />}
                        {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
                        {generatedEmail && (
                            <>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{generatedEmail}</p>
                                <Button onClick={handleSendAndTrack} className="mt-4 w-full" icon={<SendIcon className="h-4 w-4" />}>Send & Track</Button>
                            </>
                        )}
                    </div>
                )}
            </Card>
            {/* Maybe add another component here, or just have the composer take the full width */}
        </div>
    );

    const renderAnalyticsView = () => {
         const stats = useMemo(() => {
            const totalSent = sentEmails.length;
            const opened = sentEmails.filter(e => [EmailStatus.Opened, EmailStatus.Clicked, EmailStatus.Replied].includes(e.status)).length;
            const clicked = sentEmails.filter(e => [EmailStatus.Clicked, EmailStatus.Replied].includes(e.status)).length;
            const replied = sentEmails.filter(e => e.status === EmailStatus.Replied).length;
            return {
                openRate: totalSent > 0 ? (opened / totalSent * 100).toFixed(0) : 0,
                clickRate: opened > 0 ? (clicked / opened * 100).toFixed(0) : 0,
                responseRate: totalSent > 0 ? (replied / totalSent * 100).toFixed(0) : 0,
            };
        }, [sentEmails]);

        return(
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader title="Engagement Funnel (Last 30 Days)" icon={<TrendingUpIcon />} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                           {/* ... stats cards ... */}
                        </div>
                    </Card>
                    <Card>
                        <CardHeader title="Recent Activity" icon={<History />} />
                         <div className="mt-2 -mx-6">
                           <table className="min-w-full">
                                <thead className="border-b border-gray-700 text-xs text-gray-400 uppercase"><tr><th className="px-6 py-3 text-left">Candidate</th><th className="px-6 py-3 text-left">Subject</th><th className="px-6 py-3 text-left">Sent</th><th className="px-6 py-3 text-left">Status</th></tr></thead>
                                <tbody>{sentEmails.slice(0, 10).map(e => (
                                    <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-3 text-sm text-white">{e.candidateName}</td>
                                        <td className="px-6 py-3 text-sm text-gray-300">{e.subject}</td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{new Date(e.sentAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-3"><EmailStatusBadge status={e.status} /></td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                 </div>
                 <div className="space-y-6">
                    {/* ... Follow up reminders & AB test results cards ... */}
                 </div>
            </div>
        )
    };

    // --- MAIN RENDER ---
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Candidates</h2>
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('profiles')} className={`${activeTab === 'profiles' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>Profiles & CRM</button>
                        <button onClick={() => setActiveTab('ai_composer')} className={`${activeTab === 'ai_composer' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>AI Composer</button>
                        <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-3 px-1 border-b-2 font-medium text-sm`}>Email Analytics</button>
                    </nav>
                </div>
            </div>

            {activeTab === 'profiles' && renderProfileView()}
            {activeTab === 'ai_composer' && renderComposerView()}
            {activeTab === 'analytics' && renderAnalyticsView()}

            {showResumeParser && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowResumeParser(false)}>
                    <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <ResumeParser onSuccess={handleAddCandidateFromParser} onCancel={() => setShowResumeParser(false)} />
                    </Card>
                 </div>
            )}

            {/* ... Other modals from CandidateProfilesTab (group analysis) ... */}

            <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; } .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; } .input-field { padding: 0.5rem 0.75rem; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; } .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};

const ResumeParser: React.FC<{onSuccess: (data: Omit<Candidate, 'id'>) => void; onCancel: () => void;}> = ({onSuccess, onCancel}) => {
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<Partial<Candidate> | null>(null);

     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setResumeText(event.target?.result as string);
                setSelectedFile(file);
                setParseError('');
                setParsedData(null);
            };
            reader.readAsText(file);
        } else if(file) {
            setParseError(`Unsupported file type. Please use .txt or paste content.`);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
     const handleParse = async () => {
        if (!resumeText) { setParseError('Please paste or upload resume text.'); return; }
        setIsParsing(true);
        setParseError('');
        setParsedData(null);
        try {
            const result = await parseResume(resumeText);
            setParsedData(result);
        } catch (err) { setParseError(err instanceof Error ? err.message : 'Unknown parsing error.'); } finally { setIsParsing(false); }
    };
    const resetParser = () => {
        setResumeText('');
        setSelectedFile(null);
        setParsedData(null);
        setParseError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <CardHeader title="Data Entry Eraser" description="Parse resumes to auto-create candidate profiles." icon={<UploadIcon />}/>
             <div className="mt-4 space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt"/>
                <div onClick={() => fileInputRef.current?.click()} className="p-6 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-colors">
                    <UploadIcon className="h-10 w-10 text-gray-500"/>
                    <p className="mt-2 text-sm text-gray-400">Drag & drop or click to browse</p>
                    <p className="mt-1 text-xs text-gray-500">.txt files only, or paste below</p>
                </div>
                {selectedFile && <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700"><div className="flex items-center gap-2"><FileTextIcon className="h-5 w-5 text-gray-400" /><span className="text-sm text-gray-300 truncate">{selectedFile.name}</span></div><button onClick={resetParser} className="p-1 rounded-full hover:bg-gray-700"><XIcon className="h-4 w-4 text-gray-400"/></button></div>}
                <textarea placeholder="...or paste resume text here" rows={6} value={resumeText} onChange={e => setResumeText(e.target.value)} className="input-field"></textarea>
                <Button onClick={handleParse} isLoading={isParsing} className="w-full" disabled={!resumeText}>Parse Resume</Button>
            </div>
            {(isParsing || parseError || parsedData) && (
                <div className="mt-4">
                    {isParsing && <Spinner text="Parsing resume..." />}
                    {parseError && <p className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800 rounded-md">{parseError}</p>}
                    {parsedData && !isParsing && <ParsedResumeForm initialData={parsedData} onSave={onSuccess} onCancel={onCancel} />}
                </div>
            )}
        </div>
    )
}

const ParsedResumeForm: React.FC<{ initialData: Partial<Candidate>; onSave: (data: Omit<Candidate, 'id'>) => void; onCancel: () => void; }> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '', skills: initialData.skills || '', resumeSummary: initialData.resumeSummary || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, status: CandidateStatus.Passive, applicationHistory: [], crm: BLANK_CRM }); };
    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-gray-800 rounded-md border border-gray-700 animate-fade-in">
            <h4 className="font-semibold text-gray-200">Review Extracted Information</h4>
            {/* ... form fields for name, email, etc. ... */}
             <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Add Candidate</Button>
            </div>
        </form>
    );
};