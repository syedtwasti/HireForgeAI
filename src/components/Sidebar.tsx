import React from 'react';
import { LayoutDashboard, Briefcase, FileText, UserCircle2, Settings, LogOut, CheckCircle } from 'lucide-react';
<img src="/hireforge.svg" alt="HireForge" className="w-9 h-9" />
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  hasUnreadMessages?: boolean;
}

const ClaireIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 11c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" />
    <path d="M4.5 11v4a3 3 0 0 0 3 3" />
    <path d="M19.5 11v4a3 3 0 0 1-3 3" />
    <rect x="2" y="9" width="3" height="6" rx="1.5" />
    <rect x="19" y="9" width="3" height="6" rx="1.5" />
    <path d="M8 13v1a4 4 0 0 0 8 0v-1" />
    <path d="M5 11c2.3 2 4.7 2 7 0c2.3 2 4.7 2 7 0" />
    <path d="M6 22a6 6 0 0 1 6-5h0a6 6 0 0 1 6 5" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasUnreadMessages = false }) => {
  const mainNavItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.JOBS, label: 'My Applications', icon: Briefcase },
    { id: ViewState.OFFERS, label: 'Offers Received', icon: CheckCircle },
    { id: ViewState.RESUME, label: 'Resume Builder', icon: FileText },
    { id: ViewState.AVATAR, label: 'AI Avatar', icon: UserCircle2 },
  ];

  return (
    <div className="glass-sidebar w-64 h-screen flex flex-col flex-shrink-0 no-print sticky top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-purple-500/20">
        <img src="/hireforge.svg" alt="HireForge" className="w-9 h-9" />
        <span className="text-xl font-bold text-white tracking-tight">HireForge AI</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? 'bg-purple-600/40 text-white border border-purple-400/30 shadow-lg shadow-purple-900/30'
                  : 'text-purple-200/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-purple-300' : 'text-purple-400/60'} />
              {item.label}
            </button>
          );
        })}

        <div className="my-3 border-t border-purple-500/20 mx-2" />

        <button
          onClick={() => onChangeView(ViewState.CLAIRE)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
            currentView === ViewState.CLAIRE
              ? 'bg-purple-600/40 text-white border border-purple-400/30 shadow-lg shadow-purple-900/30'
              : hasUnreadMessages
              ? 'bg-purple-500/20 text-white border border-purple-400/40 animate-pulse'
              : 'text-purple-200/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ClaireIcon size={18} className={currentView === ViewState.CLAIRE || hasUnreadMessages ? 'text-purple-300' : 'text-purple-400/60'} />
          <span className="flex-1 text-left">Claire</span>
          {hasUnreadMessages && <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />}
        </button>
      </nav>

      <div className="p-4 border-t border-purple-500/20">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200/60 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
          <Settings size={18} />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200/60 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;