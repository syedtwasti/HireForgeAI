import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { Job } from '../types';
import { JobStatus } from '../types';
import { TrendingUp, Clock, CheckCircle, XCircle, Award, Download } from 'lucide-react';

interface DashboardProps { jobs: Job[]; }

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="glass-card p-6 rounded-2xl flex items-start justify-between group hover:border-purple-400/40 transition-all duration-300">
    <div>
      <p className="text-sm font-medium text-purple-200/70 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ jobs }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  const totalApplied = jobs.filter(j =>
    j.origin === 'application' ||
    (!j.origin && j.status !== JobStatus.OFFER && j.status !== JobStatus.ACCEPTED)
  ).length;

  const interviewing = jobs.filter(j => j.status === JobStatus.INTERVIEW).length;
  const offers = jobs.filter(j => j.status === JobStatus.OFFER).length;
  const rejected = jobs.filter(j => j.status === JobStatus.REJECTED).length;
  const accepted = jobs.filter(j => j.status === JobStatus.ACCEPTED).length;
  const acceptedJobs = jobs.filter(j => j.status === JobStatus.ACCEPTED);

  const activityData = useMemo(() => {
    const data = [];
    const today = new Date();
    let daysToLookBack = timeRange === '30d' ? 30 : timeRange === 'all' ? 90 : 7;
    const appsByDate: Record<string, number> = {};
    const offersByDate: Record<string, number> = {};

    jobs.forEach(job => {
      if (job.dateApplied) {
        const isApp = job.origin === 'application' || (!job.origin && job.status !== JobStatus.OFFER);
        if (isApp) appsByDate[job.dateApplied] = (appsByDate[job.dateApplied] || 0) + 1;
        if (job.status === JobStatus.OFFER || job.status === JobStatus.ACCEPTED)
          offersByDate[job.dateApplied] = (offersByDate[job.dateApplied] || 0) + 1;
      }
    });

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      let displayDay = timeRange === '7d'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({ name: displayDay, apps: appsByDate[dateString] || 0, offers: offersByDate[dateString] || 0 });
    }
    return data;
  }, [jobs, timeRange]);

  const statusData = [
    { name: 'Applied', count: jobs.filter(j => j.status === JobStatus.APPLIED).length },
    { name: 'Interview', count: interviewing },
    { name: 'Offer', count: offers },
    { name: 'Accepted', count: accepted },
    { name: 'Rejected', count: rejected },
  ];
  const maxStatusCount = Math.max(...statusData.map(d => d.count), 1);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-purple-300/70">Welcome back! Here's your job search progress.</p>
        </div>
        <button className="glass-card text-purple-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition flex items-center gap-2">
          <Download size={16} />
          Download Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Applied" value={totalApplied} icon={TrendingUp} color="text-purple-400" bg="bg-purple-500/20" />
        <StatCard title="Interviewing" value={interviewing} icon={Clock} color="text-amber-400" bg="bg-amber-500/20" />
        <StatCard title="Offers Received" value={offers} icon={CheckCircle} color="text-blue-400" bg="bg-blue-500/20" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} color="text-rose-400" bg="bg-rose-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-9 flex flex-col gap-8">
          {/* Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Application Activity</h3>
              <div className="flex bg-white/5 p-1 rounded-lg">
                {(['7d', '30d', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeRange === range
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(167,139,250,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a78bfa', fontSize: 12 }} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a78bfa', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'rgba(26,5,51,0.9)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="offers" name="Offers" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorOffers)" />
                  <Area type="monotone" dataKey="apps" name="Applications" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accepted Jobs */}
          <div className="glass-card p-6 rounded-2xl h-60 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-purple-400" size={20} />
              Accepted Jobs
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {acceptedJobs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-purple-300/50 text-sm">No accepted applications yet.</div>
              ) : (
                acceptedJobs.map(job => (
                  <div key={job.id} className="p-4 glass rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div>
                      <div className="font-bold text-white">{job.role}</div>
                      <div className="text-purple-300 text-sm">{job.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-200 font-medium mb-1">{job.salary || 'Salary N/A'}</div>
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">{job.dateApplied}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Status Breakdown</h3>
            <div className="flex flex-col gap-5">
              {statusData.map((item) => (
                <div key={item.name} className="grid grid-cols-[80px_1fr_24px] items-center gap-3">
                  <span className="text-sm font-medium text-purple-200/70 truncate">{item.name}</span>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%`, minWidth: item.count > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-purple-300 text-right font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;