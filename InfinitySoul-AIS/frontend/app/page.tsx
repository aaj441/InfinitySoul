'use client'

import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [report, setReport] = useState<any>(null)

  const runAudit = async () => {
    const res = await fetch('http://localhost:3001/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })
    setReport(await res.json())
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Infinity Soul AIS v1.1</h1>
      <input 
        className="border p-2 mt-4 w-full" 
        placeholder="Enter AI system URL" 
        value={url} 
        onChange={e => setUrl(e.target.value)} 
      />
      <button 
        className="bg-blue-600 text-white p-2 mt-4"
        onClick={runAudit}
      >
        Run Risk Audit
      </button>
      {report && <pre className="mt-4 bg-gray-100 p-4">{JSON.stringify(report, null, 2)}</pre>}
    </div>
  )
}
