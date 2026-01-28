"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, FileVideo } from "lucide-react";

interface JobProgressProps {
  jobId: string;
  onComplete: (data: any) => void;
}

export default function JobProgress({ jobId, onComplete }: JobProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok) {
          setProgress(data.progress || 0);
          
          // Map progress to human readable status
          if (data.progress < 10) setStatus("Queued...");
          else if (data.progress < 30) setStatus("Downloading Video...");
          else if (data.progress < 50) setStatus("Extracting Audio...");
          else if (data.progress < 60) setStatus("Transcribing Audio...");
          else if (data.progress < 80) setStatus("Analyzing Viral Content...");
          else if (data.progress < 100) setStatus("Cutting & Rendering...");
          else setStatus("Finalizing...");

          if (data.state === "completed") {
            clearInterval(interval);
            setStatus("Process Complete!");
            setProgress(100);
            onComplete(data.result);
          } else if (data.state === "failed") {
            clearInterval(interval);
            setError(data.error || "Job failed");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, onComplete]);

  if (error) {
    return (
      <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span>{status}</span>
        <span>{progress}%</span>
      </div>
      
      {/* Progress Bar Track */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        {/* Progress Fill */}
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress === 100 && (
        <div className="pt-2 flex justify-center text-green-500 items-center gap-2">
           <CheckCircle className="w-5 h-5" />
           <span className="font-semibold">All Done!</span>
        </div>
      )}
    </div>
  );
}
