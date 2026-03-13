import { Layout } from "@/components/layout";
import { Card, StatCard, RiskBadge, EmotionBadge } from "@/components/ui-elements";
import { useAnalyticsSummaryData } from "@/hooks/use-analytics";
import { useCallsData } from "@/hooks/use-calls";
import { 
  PhoneCall, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert,
  Loader2,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export function Dashboard() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalyticsSummaryData();
  const { data: calls, isLoading: isLoadingCalls } = useCallsData();

  if (isLoadingAnalytics || isLoadingCalls) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-primary font-display tracking-widest animate-pulse">INITIALIZING DASHBOARD...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const recentCalls = calls?.slice(0, 8) || [];

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-wider flex items-center gap-3">
          <ActivityPulse />
          Operations Overview
        </h1>
        <p className="text-muted-foreground mt-2">Real-time emergency sentiment and risk analysis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Calls (24h)" 
          value={analytics?.totalCallsToday || 0} 
          icon={PhoneCall} 
          colorClass="text-blue-400"
        />
        <StatCard 
          title="Active Connections" 
          value={analytics?.activeCalls || 0} 
          icon={ActivityPulseIcon} 
          colorClass="text-success"
        />
        <StatCard 
          title="Escalated Incidents" 
          value={analytics?.escalatedCalls || 0} 
          icon={TrendingUp} 
          colorClass="text-warning"
          trend={12}
        />
        <StatCard 
          title="High Risk Alerts" 
          value={analytics?.highRiskCallsToday || 0} 
          icon={ShieldAlert} 
          colorClass="text-destructive drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]"
          trend={24}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Calls List */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-display text-white">Recent Call Streams</h2>
              <Link href="/live-call" className="text-xs text-primary hover:underline uppercase tracking-wider font-bold">
                View Live Monitor
              </Link>
            </div>
            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="p-4 text-xs text-muted-foreground font-semibold uppercase">ID/Time</th>
                    <th className="p-4 text-xs text-muted-foreground font-semibold uppercase">Caller</th>
                    <th className="p-4 text-xs text-muted-foreground font-semibold uppercase">Status</th>
                    <th className="p-4 text-xs text-muted-foreground font-semibold uppercase">Emotion</th>
                    <th className="p-4 text-xs text-muted-foreground font-semibold uppercase">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="border-b border-border/20 hover:bg-secondary/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm text-white">#{call.id}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(call.startTime), 'HH:mm:ss')}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-sm">{call.callerNumber}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${call.status === 'active' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                          <span className="capitalize text-muted-foreground">{call.status}</span>
                        </span>
                      </td>
                      <td className="p-4"><EmotionBadge emotion={call.primaryEmotion} /></td>
                      <td className="p-4"><RiskBadge level={call.riskLevel} /></td>
                    </tr>
                  ))}
                  {recentCalls.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No recent calls found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* System Health / Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-display text-white border-b border-border/50 pb-4 mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">AI Model Latency</span>
                <span className="text-success font-mono">124ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Audio Stream Quality</span>
                <span className="text-success font-mono">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Peak Stress Hour</span>
                <span className="text-warning font-mono">{analytics?.peakStressHour || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Avg Confidence</span>
                <span className="text-primary font-mono">{analytics?.avgConfidenceScore}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
             <h2 className="text-lg font-display text-white mb-4">Emotion Distribution</h2>
             <div className="space-y-3">
               {analytics?.emotionDistribution.map(item => (
                 <div key={item.emotion} className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span className="capitalize">{item.emotion}</span>
                     <span className="font-mono text-muted-foreground">{item.percentage}%</span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div 
                        className={`h-full ${item.emotion === 'stressed' || item.emotion === 'drunk' ? 'bg-warning' : item.emotion === 'pain' || item.emotion === 'abusive' ? 'bg-destructive' : 'bg-primary'}`} 
                        style={{ width: `${item.percentage}%` }}
                     />
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>

      </div>
    </Layout>
  );
}

function ActivityPulse() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
    </span>
  );
}

function ActivityPulseIcon(props: any) {
  return <AlertTriangle {...props} className={`animate-pulse ${props.className}`} />
}
