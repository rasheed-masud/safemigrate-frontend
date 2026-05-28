"use client";

import { useState } from "react";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

type Warning = {
  rule: string;
  severity: string;
  message: string;
  unsafe_sql: string;
  safe_sql: string;
};

export default function Home() {
  const [sql, setSql] = useState("ALTER TABLE users ADD COLUMN bio TEXT;\nCREATE INDEX idx_email ON users(email);");
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  // Clerk Authentication Hook
  const { isSignedIn, isLoaded } = useUser();

  const analyzeSQL = async () => {
    setLoading(true);
    setAnalyzed(false);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // LAUNCH MODE: Explicitly telling the backend to give the full Pro features for free
        body: JSON.stringify({ sql_text: sql, is_pro: true }), 
      });

      const data = await response.json();
      setWarnings(data.warnings);
    } catch (error) {
      console.error("Error analyzing SQL:", error);
      alert("Failed to connect to the backend.");
    } finally {
      setLoading(false);
      setAnalyzed(true);
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="h-screen bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col overflow-hidden">
      
      {/* Top Navigation Bar */}
      <nav className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-300">SafeMigrate</h1>
          <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">v0.1</span>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-500/20">
                  Sign Up Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Main Workspace (Split Pane) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Input Editor */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800">
          <div className="h-10 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <span className="text-xs text-zinc-500 font-mono">migration.sql</span>
            
            {/* SMART ANALYZE BUTTON: Requires login to run */}
            {isSignedIn ? (
              <button
                onClick={analyzeSQL}
                disabled={loading}
                className="px-4 py-1 bg-zinc-100 text-zinc-950 text-xs font-medium rounded hover:bg-white transition-colors duration-200 disabled:opacity-40 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing
                  </>
                ) : "Analyze"}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-1 bg-zinc-100 text-zinc-950 text-xs font-medium rounded hover:bg-white transition-colors duration-200 flex items-center gap-1.5">
                  Sign in to Analyze (Free)
                </button>
              </SignInButton>
            )}
          </div>
          <textarea
            className="flex-1 p-4 bg-transparent font-mono text-sm text-zinc-300 resize-none focus:outline-none placeholder-zinc-700 leading-relaxed"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Paste your migration SQL here..."
          />
        </div>

        {/* Right Pane: Output Results */}
        <div className="w-1/2 flex flex-col bg-zinc-950">
          <div className="h-10 flex items-center px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <span className="text-xs text-zinc-500 font-mono">analysis_output</span>
            {analyzed && warnings.length > 0 && (
              <div className="ml-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">{warnings.length} Issues</span>
              </div>
            )}
            {analyzed && warnings.length === 0 && (
               <div className="ml-3 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Safe</span>
             </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!analyzed ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <p className="mt-3 text-xs font-mono">Paste SQL and click Analyze</p>
              </div>
            ) : warnings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-emerald-500/50">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p className="mt-3 text-xs font-mono">Migration Safe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {warnings.map((warning, index) => (
                  <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-widest ${warning.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {warning.severity}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">{warning.rule}</span>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{warning.message}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-1 rounded-full bg-red-500"></div>
                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Unsafe</p>
                          </div>
                          <pre className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-[11px] overflow-x-auto text-red-400/80 font-mono leading-relaxed">
                            {warning.unsafe_sql}
                          </pre>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Safe</p>
                          </div>
                          {/* NO PAYWALL - EVERYONE GETS THE FIX FOR FREE */}
                          <pre className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-[11px] overflow-x-auto text-emerald-400/80 font-mono leading-relaxed">
                            {warning.safe_sql}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}