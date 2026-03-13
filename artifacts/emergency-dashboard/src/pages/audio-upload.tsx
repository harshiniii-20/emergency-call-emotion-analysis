import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, EmotionBadge, RiskBadge } from "@/components/ui-elements";
import { useEmotionAnalyzer, useKeywordDetector } from "@/hooks/use-emotion";
import { FileAudio, UploadCloud, Mic, AlertTriangle, Loader2, PlayCircle } from "lucide-react";
import { EmotionAnalysisResult, KeywordDetectionResult, EmotionAnalysisRequestLanguage } from "@workspace/api-client-react";

export function AudioUpload() {
  const [mode, setMode] = useState<'upload' | 'mic'>('upload');
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<EmotionAnalysisRequestLanguage>('english');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionResult, setEmotionResult] = useState<EmotionAnalysisResult | null>(null);
  const [keywordResult, setKeywordResult] = useState<KeywordDetectionResult | null>(null);

  const analyzeMutation = useEmotionAnalyzer();
  const keywordMutation = useKeywordDetector();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setEmotionResult(null);
    setKeywordResult(null);

    try {
      // Run both concurrently
      const [em, kw] = await Promise.all([
        analyzeMutation.mutateAsync({ data: { transcript: text, language, simulatedMode: true } }),
        keywordMutation.mutateAsync({ data: { transcript: text, language } })
      ]);
      
      setEmotionResult(em);
      setKeywordResult(kw);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isHighRisk = emotionResult?.riskLevel === 'high' || emotionResult?.riskLevel === 'critical';

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-wider flex items-center gap-3">
          <FileAudio className="text-primary" />
          Offline Analysis Module
        </h1>
        <p className="text-muted-foreground mt-2">Upload audio recordings or input transcripts for deep emotion and threat detection.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Form */}
        <Card className="p-6 flex flex-col">
          <div className="flex bg-secondary/50 p-1 rounded-xl mb-6 border border-border/50">
            <button 
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'upload' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setMode('upload')}
            >
              Upload Audio
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'mic' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setMode('mic')}
            >
              Microphone
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-display text-muted-foreground uppercase tracking-widest mb-2">Language Protocol</label>
            <select 
              className="w-full bg-background border border-border rounded-xl p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-mono text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value as EmotionAnalysisRequestLanguage)}
            >
              <option value="english">English (US/UK)</option>
              <option value="tamil">Tamil (IN)</option>
              <option value="hindi">Hindi (IN)</option>
            </select>
          </div>

          {mode === 'upload' ? (
             <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 mb-6 flex-1">
               <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
               <p className="text-sm font-medium text-white mb-1">Click to upload or drag & drop</p>
               <p className="text-xs text-muted-foreground">WAV, MP3 up to 10MB</p>
             </div>
          ) : (
             <div className="border border-border rounded-xl p-10 flex flex-col items-center justify-center text-center bg-background/50 mb-6 flex-1">
               <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 cursor-pointer hover:bg-destructive/20 border border-destructive/30">
                 <Mic className="h-6 w-6 text-destructive" />
               </div>
               <p className="text-sm font-medium text-white">Click to begin recording</p>
             </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-display text-muted-foreground uppercase tracking-widest mb-2">Manual Transcript (Override)</label>
            <textarea 
              className="w-full h-32 bg-background border border-border rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono text-sm custom-scrollbar"
              placeholder="Enter transcript to analyze directly..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <Button 
            className="w-full py-4 text-lg" 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> ANALYZING NEURAL DATA...</span>
            ) : "INITIATE ANALYSIS"}
          </Button>
        </Card>

        {/* Results Area */}
        <div className="flex flex-col gap-6">
          {isAnalyzing ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-12 border-primary/20 bg-primary/5">
               <div className="relative w-32 h-32 mb-8">
                 <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <ActivityPulse className="h-8 w-8 text-primary" />
                 </div>
               </div>
               <h3 className="font-display text-xl text-primary tracking-widest uppercase animate-pulse">Processing Audio Streams</h3>
               <p className="text-muted-foreground text-sm mt-2 font-mono">Running SER Models & NLP Extractors...</p>
            </Card>
          ) : emotionResult && keywordResult ? (
            <div className="space-y-6 animate-slide-up">
              
              {isHighRisk && (
                <div className="bg-destructive border border-destructive text-white p-4 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                  <AlertTriangle className="h-8 w-8 animate-bounce" />
                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-wider">CRITICAL RISK ALERT</h3>
                    <p className="text-sm opacity-90">{keywordResult.alertMessage || "High stress combined with emergency keywords detected."}</p>
                  </div>
                </div>
              )}

              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display text-sm text-muted-foreground uppercase tracking-widest mb-1">Primary Detection</h3>
                    <div className="flex items-end gap-4">
                      <span className="text-4xl font-bold text-white capitalize">{emotionResult.primaryEmotion}</span>
                      <EmotionBadge emotion={emotionResult.primaryEmotion} />
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-display text-sm text-muted-foreground uppercase tracking-widest mb-1">Confidence</h3>
                    <span className="text-3xl font-mono text-primary">{emotionResult.confidenceScore}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-display text-xs text-muted-foreground uppercase tracking-widest">Emotion Signature Breakdown</h4>
                  {emotionResult.emotionBreakdown.map(eb => (
                    <div key={eb.emotion} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-gray-300">{eb.emotion}</span>
                        <span className="font-mono text-muted-foreground">{eb.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                           className={`h-full ${eb.emotion === 'pain' || eb.emotion === 'abusive' ? 'bg-destructive' : eb.emotion === 'stressed' ? 'bg-warning' : 'bg-primary'}`} 
                           style={{ width: `${eb.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-sm text-muted-foreground uppercase tracking-widest mb-4">Transcript & Keyword Flags</h3>
                
                {keywordResult.detectedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <span className="text-xs text-muted-foreground self-center mr-2">FLAGS:</span>
                    {keywordResult.detectedKeywords.map((kw, i) => (
                      <Badge key={i} variant={kw.severity === 'high' ? 'destructive' : 'warning'}>
                        {kw.keyword}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-xs flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> No emergency keywords detected.
                  </div>
                )}

                <div 
                  className="p-4 bg-background rounded-xl border border-border font-mono text-sm leading-relaxed text-gray-300 custom-scrollbar max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: keywordResult.highlightedTranscript.replace(/<mark>/g, '<mark class="bg-destructive text-white px-1 rounded font-bold">') }}
                />
              </Card>

            </div>
          ) : (
             <div className="h-full border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground p-12">
               <PlayCircle className="h-16 w-16 mb-4 opacity-20" />
               <p className="font-display tracking-widest uppercase">Awaiting Input Data</p>
             </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

function ActivityPulse({ className }: { className?: string }) {
  return <Activity className={`animate-pulse ${className}`} />;
}
import { Activity } from "lucide-react";
