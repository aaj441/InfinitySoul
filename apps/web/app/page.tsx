export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          AARON OS
        </h1>
        <p className="text-zinc-400 mb-8">The Sovereign Cloud - Control Plane</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Enter Dashboard
        </a>
      </div>
    </main>
  );
}
