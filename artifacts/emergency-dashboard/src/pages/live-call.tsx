import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Badge, RiskBadge, Button, EmotionBadge } from "@/components/ui-elements";
import { useCallsData, useCallDetails, useUpdateCallStatus } from "@/hooks/use-calls";
import { AlertTriangle, Phone, PhoneOff, Mic, ShieldAlert, AlertOctagon, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function LiveCallMonitor() {
  const { data: calls } = useCallsData();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);

  const activeCalls = calls?.filter(c => c.status === 'active') || [];
  
  // Auto-select first active call if none selected
  if (!selectedCallId && activeCalls.length > 0) {
    setSelectedCallId(activeCalls[0].id);
  }

  const { data: activeCallDetails } = useCallDetails(selectedCallId || 0);
  const updateCall = useUpdateCallStatus();

  const handleEscalate = () => {
    if (!selectedCallId) return;
    updateCall.mutate({
      id: selectedCallId,
      data: { escalated: true, status: 'escalated' }
    });
  };

  const handleEndCall = () => {
    if (!selectedCallId) return;
    updateCall.mutate({
      id: selectedCallId,
      data: { status: 'ended' }
    });
    setSelectedCallId(null);
  };

  const isCritical = activeCallDetails?.riskLevel === 'critical';

  // Mock timeline data since API doesn't return full timeline on single call yet
  const mockTimeline = Array.from({length: 20}).map((_, i) => ({
    time: i,
    stress: Math.random() * 100,
    pain: Math.random() * (isCritical ? 100 : 30)
  }));

  return (
    <Layout>
      {/* Critical Alert Banner */}
      {isCritical && (
        <div className="bg-destructive/90 border border-destructive text-white p-4 rounded-xl flex items-center justify-between shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse mb-6">
          <div className="flex items-center gap-4">
            <AlertOctagon className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-display font-bold uppercase tracking-wider">HIGH RISK CALL DETECTED</h2>
              <p className="text-sm opacity-90">Emergency keywords and critical stress levels identified. Immediate escalation recommended.</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white/10 border-white hover:bg-white text-white hover:text-destructive" onClick={handleEscalate}>
            ESCALATE IMMEDIATELY
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Panel: Active Calls Queue */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <RadioPulse /> Active Queue ({activeCalls.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {activeCalls.map(call => (
              <button
                key={call.id}
                onClick={() => setSelectedCallId(call.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedCallId === call.id 
                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.1)]' 
                    : 'bg-card border-border hover:bg-secondary'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-sm font-bold text-white">{call.callerNumber}</div>
                  <RiskBadge level={call.riskLevel} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(call.startTime), 'HH:mm')}
                  <span className="mx-1">•</span>
                  <span className="uppercase">{call.language}</span>
                </div>
              </button>
            ))}
            {activeCalls.length === 0 && (
              <div className="text-center p-8 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
                No active calls.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Call Details */}
        <div className="lg:col-span-9 h-full flex flex-col gap-6">
          {activeCallDetails ? (
            <>
              {/* Header Info */}
              <Card glowColor={isCritical ? 'destructive' : 'primary'} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${isCritical ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-mono font-bold text-white">{activeCallDetails.callerNumber}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline">ID: #{activeCallDetails.id}</Badge>
                        <span className="text-sm text-muted-foreground">Connected: {format(new Date(activeCallDetails.startTime), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Primary Emotion</p>
                      <EmotionBadge emotion={activeCallDetails.primaryEmotion} />
                    </div>
                    <div className="h-10 w-px bg-border mx-2" />
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleEndCall} disabled={updateCall.isPending}>
                        <PhoneOff className="mr-2 h-4 w-4" /> End Call
                      </Button>
                      <Button variant="destructive" onClick={handleEscalate} disabled={updateCall.isPending || activeCallDetails.escalated}>
                        <ShieldAlert className="mr-2 h-4 w-4" /> {activeCallDetails.escalated ? 'Escalated' : 'Escalate'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Real-time Charts & Transcript */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                
                {/* Timeline Chart */}
                <Card className="p-4 flex flex-col h-full">
                  <h3 className="font-display text-sm text-muted-foreground uppercase tracking-widest mb-4">Emotion Timeline</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockTimeline} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'white' }}
                        />
                        <Line type="monotone" dataKey="stress" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="pain" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Transcript */}
                <Card className="p-4 flex flex-col h-full overflow-hidden">
                  <h3 className="font-display text-sm text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between">
                    Live Transcript
                    <span className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      <Mic className="h-3 w-3 animate-pulse" /> Listening
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-background/50 rounded-xl border border-border/50 font-mono text-sm leading-relaxed text-gray-300">
                    {/* Simulated transcript text with highlights */}
                    <p className="mb-3"><span className="text-primary font-bold">OP:</span> Emergency operator, what is your location?</p>
                    <p className="mb-3"><span className="text-muted-foreground">CALLER:</span> I don't know, I'm on the highway, there was a terrible <span className="bg-destructive/30 text-destructive-foreground px-1 rounded">accident</span>!</p>
                    <p className="mb-3"><span className="text-primary font-bold">OP:</span> Are you injured?</p>
                    <p className="mb-3"><span className="text-muted-foreground">CALLER:</span> Yes, I need <span className="bg-destructive/30 text-destructive-foreground px-1 rounded">help</span>, I'm <span className="bg-destructive/30 text-destructive-foreground px-1 rounded">bleeding</span> badly!</p>
                    
                    {activeCallDetails.transcript && (
                      <p className="mt-4 border-t border-border pt-4 text-white/50 italic">
                        {activeCallDetails.transcript}
                      </p>
                    )}
                    
                    {activeCallDetails.detectedKeywords.length > 0 && (
                      <div className="mt-6">
                         <p className="text-xs text-muted-foreground uppercase mb-2">Detected Flags:</p>
                         <div className="flex flex-wrap gap-2">
                           {activeCallDetails.detectedKeywords.map(kw => (
                             <Badge key={kw} variant="destructive">{kw}</Badge>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                </Card>

              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <RadioPulse className="h-16 w-16 mb-4 opacity-20" />
              <h2 className="font-display text-xl tracking-widest uppercase">Monitoring Communications</h2>
              <p className="text-sm">Select a call from the queue to view details</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

function RadioPulse({ className }: { className?: string }) {
  return <Mic className={`animate-pulse text-primary ${className}`} />;
}
