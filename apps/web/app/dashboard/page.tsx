import { AgentStatusBadge } from "@/components/agent-status";
import { MetricCard } from "@/components/metric-card";

export default function AaronDashboard() {
  return (
    <main className="min-h-screen bg-background text-white font-mono p-8 selection:bg-primary selection:text-black">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-4">
        <h1 className="text-2xl tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(0,242,234,0.5)]">
          AARON OS <span className="text-xs text-zinc-500">v1.0.4</span>
        </h1>
        <div className="flex gap-4">
           <span className="flex items-center gap-2 text-xs text-zinc-400">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             SYSTEM ONLINE
           </span>
        </div>
      </header>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Financial Intel (Scout) */}
        <section className="md:col-span-4 space-y-4" aria-label="Financial Intelligence">
          <h2 className="text-sm text-zinc-500 uppercase tracking-widest">Live Deals</h2>
          <div className="bg-surface border border-white/5 p-4 rounded-lg hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex justify-between mb-2">
              <span className="text-primary font-bold">MGA-8492</span>
              <span className="text-alert text-xs">CR: 118%</span>
            </div>
            <p className="text-zinc-400 text-sm">Cyber liability focused. 65yo Founder. Legacy tech stack.</p>
            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[85%] group-hover:animate-pulse" />
            </div>
            <p className="text-[10px] text-right mt-1 text-zinc-500">Probability: 85%</p>
          </div>
        </section>

        {/* Center Column: The Nexus (Deep Work) */}
        <section className="md:col-span-4 flex flex-col items-center justify-center border-x border-white/5" aria-label="Deep Work Timer">
          <div className="w-64 h-64 rounded-full border border-primary/20 flex items-center justify-center relative">
             <div className="absolute inset-0 border-t-2 border-primary animate-spin-slow" />
             <div className="text-4xl font-bold text-white">03:45:00</div>
          </div>
          <p className="mt-4 text-primary text-sm">DEEP WORK PROTOCOL ENGAGED</p>
        </section>

        {/* Right Column: Biometrics (The Life Asset) */}
        <section className="md:col-span-4 space-y-4" aria-label="Biometrics">
          <h2 className="text-sm text-zinc-500 uppercase tracking-widest">Biological Status</h2>
          <MetricCard label="HRV" value="82 ms" status="optimal" />
          <MetricCard label="Sleep Latency" value="4 min" status="warning" />
          <MetricCard label="Testosterone" value="910 ng/dL" status="optimal" />
        </section>
      </div>
    </main>
  );
}
