import { useState, useRef, useCallback } from "react";
import { Activity, FileAudio, UploadCloud, Mic, MicOff, AlertTriangle, Loader2, PlayCircle, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, EmotionBadge } from "@/components/ui-elements";
import { useEmotionAnalyzer, useKeywordDetector } from "@/hooks/use-emotion";
import type { EmotionAnalysisResult, KeywordDetectionResult } from "@workspace/api-client-react";

type Language = "english" | "tamil" | "hindi";

const SAMPLE_TRANSCRIPTS: Record<Language, string> = {
  english: "Please help me! There was an accident on the highway, I'm bleeding and I'm trapped. Someone attacked the driver. I need emergency services immediately, it's very dangerous here!",
  tamil: "உதவி செய்யுங்கள்! சாலை விபத்து நடந்தது, நான் காயமடைந்துள்ளேன். தீ பிடித்துள்ளது, ஆபத்தான நிலை. Emergency வேண்டும்!",
  hindi: "मदद करो! सड़क पर बड़ा हादसा हुआ है, मैं घायल हूँ और फंसा हूँ। आग लग गई है, खतरा बहुत है। तुरंत emergency भेजो!",
};

const LANG_CODES: Record<Language, string> = {
  english: "en-US",
  tamil: "ta-IN",
  hindi: "hi-IN",
};

export function AudioUpload() {
  const [mode, setMode] = useState<"upload" | "mic">("upload");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionResult, setEmotionResult] = useState<EmotionAnalysisResult | null>(null);
  const [keywordResult, setKeywordResult] = useState<KeywordDetectionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const analyzeMutation = useEmotionAnalyzer();
  const keywordMutation = useKeywordDetector();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setEmotionResult(null);
    setKeywordResult(null);
    try {
      const [em, kw] = await Promise.all([
        analyzeMutation.mutateAsync({ data: { transcript: text, language, simulatedMode: true } }),
        keywordMutation.mutateAsync({ data: { transcript: text, language } }),
      ]);
      setEmotionResult(em);
      setKeywordResult(kw);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processFile = useCallback((file: File) => {
    const validTypes = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/wave", "audio/x-wav"];
    const isValid = validTypes.includes(file.type) || file.name.match(/\.(wav|mp3)$/i);
    if (!isValid) {
      alert("Please upload a WAV or MP3 file.");
      return;
    }
    setUploadedFile(file);
    const simulated = SAMPLE_TRANSCRIPTS[language];
    setText(simulated);
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingStatus("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[language];
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingStatus("Listening... Speak now.");
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim = result[0].transcript;
        }
      }
      setText(finalTranscript + interim);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setRecordingStatus("Microphone access denied. Please allow microphone permissions.");
      } else {
        setRecordingStatus(`Error: ${event.error}`);
      }
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      setRecordingStatus("Recording stopped.");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const isHighRisk =
    (emotionResult?.riskLevel === "high" || emotionResult?.riskLevel === "critical") &&
    (keywordResult?.alertTriggered);

  const renderHighlightedTranscript = (raw: string) => {
    return raw
      .replace(/\*\*(.+?)\*\*/g, '<mark class="bg-destructive/80 text-white px-1 rounded font-bold">$1</mark>')
      .replace(/<mark>/g, '<mark class="bg-destructive/80 text-white px-1 rounded font-bold">');
  };

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-wider flex items-center gap-3">
          <FileAudio className="text-primary" />
          Offline Analysis Module
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload audio recordings or use your microphone for deep emotion and threat detection.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="p-6 flex flex-col gap-5">
          {/* Mode Toggle */}
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
            <button
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${mode === "upload" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-white"}`}
              onClick={() => { setMode("upload"); setRecordingStatus(""); }}
            >
              Upload Audio
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${mode === "mic" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-white"}`}
              onClick={() => { setMode("mic"); setUploadedFile(null); setRecordingStatus(""); }}
            >
              Microphone
            </button>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-display text-muted-foreground uppercase tracking-widest mb-2">
              Language Protocol
            </label>
            <select
              className="w-full bg-background border border-border rounded-xl p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-mono text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="english">English (US/UK)</option>
              <option value="tamil">Tamil (IN)</option>
              <option value="hindi">Hindi (IN)</option>
            </select>
          </div>

          {/* Upload Zone */}
          {mode === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,audio/wav,audio/mpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploadedFile ? (
                <div className="border border-primary/50 bg-primary/5 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB — Transcript simulated</p>
                    </div>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => { setUploadedFile(null); setText(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 transition-all ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <UploadCloud className={`h-10 w-10 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-medium text-white mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground">WAV, MP3 up to 10MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-background/50 gap-4">
              <button
                className={`h-20 w-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isRecording ? "bg-destructive/20 border-destructive shadow-[0_0_30px_rgba(255,0,0,0.4)] animate-pulse" : "bg-secondary/50 border-border hover:bg-destructive/10 hover:border-destructive/50"}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicOff className="h-8 w-8 text-destructive" /> : <Mic className="h-8 w-8 text-muted-foreground" />}
              </button>
              <p className="text-sm font-medium text-white">
                {isRecording ? "Click to stop recording" : "Click to start recording"}
              </p>
              {recordingStatus && (
                <p className={`text-xs ${recordingStatus.includes("denied") || recordingStatus.includes("Error") ? "text-destructive" : "text-primary"}`}>
                  {recordingStatus}
                </p>
              )}
              {isRecording && (
                <div className="flex gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-destructive rounded-full animate-bounce"
                      style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transcript Input */}
          <div>
            <label className="block text-xs font-display text-muted-foreground uppercase tracking-widest mb-2">
              {mode === "upload" ? "Simulated Transcript (editable)" : "Live Transcript"}
            </label>
            <textarea
              className="w-full h-28 bg-background border border-border rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono text-sm"
              placeholder="Transcript will appear here, or type directly to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <Button
            className="w-full py-4 text-base"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" /> ANALYZING NEURAL DATA...
              </span>
            ) : "INITIATE ANALYSIS"}
          </Button>
        </Card>

        {/* Results Panel */}
        <div className="flex flex-col gap-6">
          {isAnalyzing ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-12 border-primary/20 bg-primary/5">
              <div className="relative w-28 h-28 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="font-display text-lg text-primary tracking-widest uppercase animate-pulse">Processing Audio Streams</h3>
              <p className="text-muted-foreground text-sm mt-2 font-mono">Running SER Models & NLP Extractors...</p>
            </Card>
          ) : emotionResult && keywordResult ? (
            <div className="space-y-5">
              {isHighRisk && (
                <div className="bg-destructive border border-destructive text-white p-4 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                  <AlertTriangle className="h-7 w-7 shrink-0 animate-bounce" />
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wider">HIGH RISK CALL – Escalate Immediately</h3>
                    <p className="text-sm opacity-90">{keywordResult.alertMessage || "High stress combined with emergency keywords detected."}</p>
                  </div>
                </div>
              )}

              <Card className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-xs font-display text-muted-foreground uppercase tracking-widest mb-1">Primary Detection</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-bold text-white capitalize">{emotionResult.primaryEmotion}</span>
                      <EmotionBadge emotion={emotionResult.primaryEmotion} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-display text-muted-foreground uppercase tracking-widest mb-1">Confidence</p>
                    <span className="text-3xl font-mono text-primary">{emotionResult.confidenceScore}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-display text-muted-foreground uppercase tracking-widest">Emotion Breakdown</p>
                  {emotionResult.emotionBreakdown.map((eb) => (
                    <div key={eb.emotion} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-gray-300">{eb.emotion}</span>
                        <span className="font-mono text-muted-foreground">{eb.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${eb.emotion === "pain" || eb.emotion === "abusive" ? "bg-destructive" : eb.emotion === "stressed" ? "bg-warning" : eb.emotion === "drunk" ? "bg-purple-400" : "bg-primary"}`}
                          style={{ width: `${eb.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <p className="text-xs font-display text-muted-foreground uppercase tracking-widest mb-4">Transcript & Keyword Flags</p>
                {keywordResult.detectedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <span className="text-xs text-muted-foreground self-center mr-1">FLAGS:</span>
                    {keywordResult.detectedKeywords.map((kw, i) => (
                      <Badge key={i} variant={kw.severity === "high" ? "destructive" : "warning"}>
                        {kw.keyword}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> No emergency keywords detected.
                  </div>
                )}
                <div
                  className="p-4 bg-background rounded-xl border border-border font-mono text-sm leading-relaxed text-gray-300 max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: renderHighlightedTranscript(keywordResult.highlightedTranscript) }}
                />
              </Card>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground p-12 min-h-64">
              <PlayCircle className="h-16 w-16 mb-4 opacity-20" />
              <p className="font-display tracking-widest uppercase">Awaiting Input Data</p>
              <p className="text-xs mt-2 text-center">Upload an audio file or record via microphone, then click Initiate Analysis</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
