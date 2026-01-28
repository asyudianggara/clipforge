import { ArrowRight, Video, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
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
        </div>

        {/* Input Area */}
        <div className="w-full max-w-xl p-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 transition-all hover:border-indigo-500/30">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Video className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Paste YouTube, TikTok, or Instagram link..."
              className="w-full h-12 pl-10 pr-4 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <button className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
            <span>Generate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Temporary Status or Features Grid could go here */}
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
      </div>
    </main>
  );
}
