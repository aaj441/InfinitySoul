from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import sys
import os

# Add the parent directory to the path so we can import agents
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents import scout_agent, wcag_agent

app = FastAPI(
    title="Infinity Soul Protocol",
    description="Orchestration layer for distributed agents",
    version="1.0.0",
    docs_url="/docs"  # Auto-generated Swagger UI
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (The Contract) ---
class TargetCriteria(BaseModel):
    sector: str = Field(..., example="Cyber MGA")
    max_combined_ratio: int = Field(100, ge=0, le=200)
    min_distress_signal: float = Field(0.7, description="0 to 1 score of financial distress")

class AcquisitionTarget(BaseModel):
    id: str
    name: str
    distress_score: float
    probability: float
    suggested_offer: dict

class WCAGAuditRequest(BaseModel):
    url: str = Field(..., example="https://example.com")

class WCAGAuditResponse(BaseModel):
    compliance_score: float
    url: str
    issues: List[str] = []

# --- Dependencies ---
async def get_db_session():
    """Placeholder for PostgreSQL connection yielding"""
    # In production, this would yield a database session
    # from sqlalchemy.orm import Session
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()
    pass

# --- Endpoints ---

@app.get("/health")
async def health_check():
    """System heartbeat for Kubernetes/Railway probes."""
    return {"status": "operational", "system": "Xavier"}

@app.post("/protocol/scan", response_model=List[AcquisitionTarget])
async def trigger_scout(criteria: TargetCriteria, background_tasks: BackgroundTasks):
    """
    Triggers the Scout Agent asynchronously. 
    Returns 202 Accepted immediately so UI doesn't freeze.
    """
    # In a real Google env, this pushes to Pub/Sub. 
    # Here, we use FastAPI background tasks or Celery.
    try:
        # For now, return mock data since agents are stubs
        # In production: task_id = scout_agent.schedule_scan(criteria.dict())
        
        return [
            {
                "id": "pending",
                "name": "Scan Initiated",
                "distress_score": 0.0,
                "probability": 0.0,
                "suggested_offer": {}
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/protocol/wcag-audit", response_model=WCAGAuditResponse)
async def run_lucy_audit(request: WCAGAuditRequest):
    """
    Runs the WCAG Agent (Lucy) against a target URL.
    Used for the Lead Magnet.
    """
    try:
        # For now, return mock data since agents are stubs
        # In production: result = wcag_agent.audit(request.url)
        
        return {
            "compliance_score": 0.85,
            "url": request.url,
            "issues": [
                "Missing alt text on 3 images",
                "Insufficient color contrast on header"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """API root - redirect to docs"""
    return {
        "message": "Infinity Soul Protocol - Orchestrator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
