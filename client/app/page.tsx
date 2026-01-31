"use client";

import { ArrowRight, Video, Sparkles, Loader2, Download, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import JobProgress from "./components/JobProgress";
import SettingsModal from "./components/SettingsModal";

export default function Home() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<{ provider: string; apiKey: string }>({ 
    provider: "local", 
    apiKey: "" 
  });
  const [clipCount, setClipCount] = useState(3);

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
    if (mode === "url" && !url) return;
    if (mode === "upload" && !file) return;
    
    setIsLoading(true);
    setResults(null);
    setCurrentJobId(null);
    setUploadProgress(0);

    try {
      let response;
      
      if (mode === "url") {
        response = await fetch("http://localhost:5000/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url,
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey || null,
            clipCount: clipCount
          }),
        });
      } else {
        // Handle File Upload
        const formData = new FormData();
        formData.append("video", file!);
        formData.append("provider", aiConfig.provider);
        if (aiConfig.apiKey) formData.append("apiKey", aiConfig.apiKey);
        formData.append("clipCount", clipCount.toString());

        response = await fetch("http://localhost:5000/api/jobs/upload", {
          method: "POST",
          body: formData,
        });
      }

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
            <span>Transformasi Video Bertenaga AI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-heading tracking-tight text-white">
            CLIP<span className="text-indigo-500">FORGE</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Ubah video panjang menjadi shorts viral secara instan. Tempel URL video Anda di bawah dan biarkan AI yang bekerja.
          </p>
          {/* Provider Badge */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-gray-500">Menggunakan:</span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              {aiConfig.provider === "local" ? "Lokal (Gratis)" : aiConfig.provider.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Input Area (Hide when job is running or done to focus user) */}
        {!currentJobId && !results && (
          <div className="w-full max-w-xl space-y-4">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-secondary/50 rounded-xl border border-border/50 w-fit mx-auto">
              <button
                onClick={() => setMode("url")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === "url" ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
              >
                Video Link
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === "upload" ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
              >
                Upload File
              </button>
            </div>

            {/* Input Selection */}
            <div className={`p-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 transition-all hover:border-indigo-500/30 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {mode === "url" ? (
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Video className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={url || ""}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Tempel tautan YouTube, TikTok, atau Instagram..."
                    className="w-full h-12 pl-10 pr-4 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              ) : (
                <div className="relative flex-1 h-12">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                    <Download className="w-5 h-5" />
                  </div>
                  
                  {/* Custom Placeholder UI */}
                  {!file && (
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none z-10 truncate w-[calc(100%-3rem)] text-left">
                      Pilih file video (MP4, MKV, dll.)
                    </div>
                  )}
                  {file && (
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-indigo-400 font-medium z-10 truncate w-[calc(100%-3rem)] text-left pr-4">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </div>
                  )}

                  {/* Invisible Input Overlay */}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>
              )}
              
              <button 
                onClick={handleGenerate}
                disabled={isLoading || (mode === "url" ? !url : !file)}
                className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === "url" ? "Buat Video" : "Unggah & Proses"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Clip Count Control */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">Jumlah Klip:</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-sm font-bold rounded border border-indigo-500/30">
                  {clipCount}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={clipCount} 
                onChange={(e) => setClipCount(parseInt(e.target.value))}
                className="w-32 sm:w-48 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Job Progress */}
        {currentJobId && !results && (
          <JobProgress jobId={currentJobId} onComplete={handleJobComplete} />
        )}

        {/* Results Gallery */}
        {results && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold mb-6 text-left">Video Shorts Viral Anda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((clip: any, idx: number) => (
                <div key={idx} className="bg-card border border-border overflow-hidden rounded-xl p-3 flex gap-4 items-center group hover:border-indigo-500/50 transition-all">
                  <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold line-clamp-1">Clip #{idx + 1}</h3>
                    <p className="text-xs text-muted-foreground">
                      Durasi: {Math.round((clip.info.end_time || 0) - (clip.info.start_time || 0))}s
                    </p>
                    <p className="text-xs text-indigo-400 mt-1">Skor Viral: {clip.info.score}/100</p>
                  </div>
                  <button 
                    onClick={() => window.open(`http://localhost:5000/downloads/${clip.filename}`, '_blank')}
                    className="p-2 bg-secondary text-foreground rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { setResults(null); setCurrentJobId(null); setUrl(""); }}
              className="mt-8 text-sm text-muted-foreground hover:text-foreground underline"
            >
              Buat Baru
            </button>
          </div>
        )}

        {/* Features Grid (Show only on idle) */}
        {!currentJobId && !results && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-12 opacity-80">
            {[
              { label: "Pemotongan Cerdas", desc: "AI mendeteksi momen viral" },
              { label: "Teks Otomatis", desc: "Termasuk subtitle animasi" },
              { label: "Format Viral", desc: "Siap Format Vertikal 9:16" },
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
