import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import ResumeBuilder from './components/ResumeBuilder';
import AvatarGenerator from './components/AvatarGenerator';
import ClaireChat from './components/ClaireChat';
import type { Job, Resume, Message } from './types';
import { ViewState, JobStatus } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const savedJobs = localStorage.getItem('jobflow_jobs');
      return savedJobs ? JSON.parse(savedJobs) : [];
    } catch (e) {
      console.error("Failed to parse jobs from local storage", e);
      return [];
    }
  });

  const [claireMessages, setClaireMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi there! I'm Claire, your personal job search assistant. How can I help you land your dream job today?"
    }
  ]);
  const [unreadClaire, setUnreadClaire] = useState(false);

  const [resume, setResume] = useState<Resume>({
    fullName: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+1 (555) 123-4567',
    summary: 'Experienced Software Engineer with a passion for building scalable web applications.',
    skills: 'React, TypeScript, Node.js, Tailwind CSS, AWS, Docker, GraphQL',
    experience: [
      {
        id: '1',
        title: 'Senior Frontend Engineer',
        company: 'TechCorp Inc.',
        date: '2021 - Present',
        details: 'Led the migration of legacy codebase to React 18. Improved site performance by 40%.'
      }
    ],
    education: [
      {
        id: '1',
        title: 'B.S. Computer Science',
        company: 'University of Technology',
        date: '2017 - 2021',
        details: "Graduated with Honors. Dean's List all semesters."
      }
    ],
    projects: [
      {
        id: '1',
        name: 'E-commerce Platform',
        technologies: 'Next.js, Stripe, Supabase',
        link: 'github.com/alex/shop',
        description: 'Built a fully functional e-commerce store with real-time inventory management.'
      }
    ]
  });

  useEffect(() => {
    try {
      localStorage.setItem('jobflow_jobs', JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to save jobs to local storage", e);
    }
  }, [jobs]);

  useEffect(() => {
    if (currentView === ViewState.CLAIRE) {
      setUnreadClaire(false);
    }
  }, [currentView]);

  const handleAttachAvatar = (avatarUrl: string) => {
    setResume(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleJobStatusChange = (job: Job, newStatus: JobStatus) => {
    if (newStatus === JobStatus.ACCEPTED || newStatus === JobStatus.REJECTED) {
      let messageText = '';
      if (newStatus === JobStatus.ACCEPTED) {
        messageText = `🎉 Congratulations! I noticed you accepted an offer for the **${job.role}** position at **${job.company}**! Do you need any tips on salary negotiation or preparing for your first day?`;
      } else if (newStatus === JobStatus.REJECTED) {
        messageText = `I saw the update about the **${job.role}** role at **${job.company}**. Don't be discouraged — rejection is often just redirection. 🦁 Would you like to analyze the job description together?`;
      }
      if (messageText) {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'model',
          text: messageText
        };
        setClaireMessages(prev => [...prev, newMessage]);
        if (currentView !== ViewState.CLAIRE) {
          setUnreadClaire(true);
        }
      }
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard jobs={jobs} />;
      case ViewState.JOBS:
        return <JobTracker jobs={jobs} setJobs={setJobs} viewMode="applications" onStatusChange={handleJobStatusChange} />;
      case ViewState.OFFERS:
        return <JobTracker jobs={jobs} setJobs={setJobs} viewMode="offers" onStatusChange={handleJobStatusChange} />;
      case ViewState.RESUME:
        return <ResumeBuilder resume={resume} setResume={setResume} />;
      case ViewState.AVATAR:
        return <AvatarGenerator onAttachToResume={handleAttachAvatar} />;
      case ViewState.CLAIRE:
        return <ClaireChat messages={claireMessages} setMessages={setClaireMessages} />;
      default:
        return <Dashboard jobs={jobs} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-rose text-slate-800 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        hasUnreadMessages={unreadClaire}
      />
      <main className="flex-1 h-screen overflow-auto relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;