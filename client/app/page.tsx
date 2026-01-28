"use client";

import { ArrowRight, Video, Sparkles, Loader2, Download, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import JobProgress from "./components/JobProgress";
import SettingsModal from "./components/SettingsModal";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<{ provider: string; apiKey: string }>({ 
    provider: "local", 
    apiKey: "" 
  });

  // Load AI config on mount
  useEffect(() => {
    const saved = localStorage.getItem("clipforge_ai_config");
    if (saved) {
      try {
        setAiConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load AI config", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setResults(null);
    setCurrentJobId(null);

    try {
      // Send provider and API key from user settings
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentJobId(data.jobId);
      } else {
        alert(`Error: ${data.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to server");
      setIsLoading(false);
    }
  };

  const handleJobComplete = (resultData: any) => {
    setResults(resultData.segments || []);
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        {/* Header */}
        <div className="space-y-4 relative">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-0 right-0 p-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors group"
            title="Configure AI Provider"
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI-Powered Video Repurposing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-heading tracking-tight text-white">
            CLIP<span className="text-indigo-500">FORGE</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Transform long videos into viral shorts instantly. Paste your video URL below and let AI handle the rest.
          </p>
          {/* Provider Badge */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-gray-500">Using:</span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              {aiConfig.provider === "local" ? "Local (Free)" : aiConfig.provider.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Input Area (Hide when job is running or done to focus user) */}
        {!currentJobId && !results && (
          <div className="w-full max-w-xl p-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 transition-all hover:border-indigo-500/30">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Video className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube, TikTok, or Instagram link..."
                className="w-full h-12 pl-10 pr-4 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !url}
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Job Progress */}
        {currentJobId && !results && (
          <JobProgress jobId={currentJobId} onComplete={handleJobComplete} />
        )}

        {/* Results Gallery */}
        {results && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold mb-6 text-left">Your Viral Shorts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((clip: any, idx: number) => (
                <div key={idx} className="bg-card border border-border overflow-hidden rounded-xl p-3 flex gap-4 items-center group hover:border-indigo-500/50 transition-all">
                  <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold line-clamp-1">Clip #{idx + 1}</h3>
                    <p className="text-xs text-muted-foreground">Duration: {Math.round(clip.info.end - clip.info.start)}s</p>
                    <p className="text-xs text-indigo-400 mt-1">Viral Score: {clip.info.score}/100</p>
                  </div>
                  <button className="p-2 bg-secondary text-foreground rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { setResults(null); setCurrentJobId(null); setUrl(""); }}
              className="mt-8 text-sm text-muted-foreground hover:text-foreground underline"
            >
              Create New
            </button>
          </div>
        )}

        {/* Features Grid (Show only on idle) */}
        {!currentJobId && !results && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-12 opacity-80">
            {[
              { label: "Smart Trimming", desc: "AI detects viral moments" },
              { label: "Auto Captions", desc: "Animated subtitles included" },
              { label: "Viral Format", desc: "Vertical 9:16 ready" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-secondary/20 border border-border/30 backdrop-blur-md">
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(config) => setAiConfig(config)}
      />
    </main>
  );
}
