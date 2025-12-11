# Infinity Soul AIS - API Documentation

## Base URL

**Development**: `http://localhost:3001`  
**Production**: `https://your-backend-url.com`

## Authentication

Currently, the API is open for testing. Production deployment will require API keys.

**Future**: OAuth2 / API Key authentication
```
Authorization: Bearer YOUR_API_KEY
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the backend is running.

**Request**:
```bash
curl http://localhost:3001/health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T19:00:00.000Z"
}
```

**Response Codes**:
- `200 OK`: Service is healthy
- `500 Internal Server Error`: Service is down

---

### 2. Run Full Audit

**POST** `/api/audit`

Runs a comprehensive risk audit on an AI system.

**Request**:
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/ai-system"}'
```

**Request Body**:
```json
{
  "url": "https://example.com/ai-system"
}
```

**Response** (200 OK):
```json
{
  "url": "https://example.com/ai-system",
  "timestamp": "2025-12-10T19:00:00.000Z",
  "modules": {
    "aiData": {
      "hasLogging": true,
      "modelType": "GPT-4",
      "biasScore": 85,
      "vulnerabilities": ["prompt-injection-risk", "data-leakage-potential"],
      "compliance": {
        "hasAuditTrail": true,
        "hasVersionControl": true,
        "hasRollbackCapability": true
      }
    },
    "accessibility": {
      "wcagScore": 92,
      "violations": ["missing-alt-text", "low-contrast", "keyboard-navigation-issues"],
      "level": "AA",
      "recommendations": [
        "Add alt text to all images",
        "Increase color contrast ratios",
        "Ensure full keyboard accessibility"
      ]
    },
    "security": {
      "sslValid": true,
      "encryption": "TLS 1.3",
      "exposedEndpoints": 0,
      "dataProtection": {
        "hasEncryptionAtRest": true,
        "hasEncryptionInTransit": true,
        "hasAccessControls": true,
        "gdprCompliant": true
      }
    },
    "stress": {
      "jailbreakResistance": 88,
      "hallucinationRate": 2.3,
      "uptime": 99.9,
      "responseTime": 250,
      "concurrentUsers": 750
    },
    "nist": {
      "govern": "Complete",
      "map": "Partial",
      "measure": "In Progress",
      "manage": "Complete"
    }
  },
  "insuranceReadiness": {
    "overall": 87,
    "riskTier": "LOW",
    "eligibleForCyber": true,
    "eligibleForEO": true,
    "eligibleForGL": true,
    "breakdown": {
      "ai": 25,
      "accessibility": 18,
      "security": 25,
      "stress": 13,
      "nist": 7
    }
  },
  "vaultId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Codes**:
- `200 OK`: Audit completed successfully
- `400 Bad Request`: Missing or invalid URL
- `500 Internal Server Error`: Audit failed

**Error Response** (400):
```json
{
  "error": "URL is required"
}
```

**Error Response** (500):
```json
{
  "error": "Audit failed",
  "details": "Connection timeout"
}
```

---

### 3. Get Partner Score (Coming Soon)

**GET** `/api/partner/scores/:vaultId`

Retrieve audit results for partners (insurance companies, compliance officers).

**Request**:
```bash
curl http://localhost:3001/api/partner/scores/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_PARTNER_API_KEY"
```

**Response** (200 OK):
```json
{
  "message": "Partner API coming soon"
}
```

**Future Implementation**:
```json
{
  "vaultId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com/ai-system",
  "timestamp": "2025-12-10T19:00:00.000Z",
  "insuranceReadiness": {
    "overall": 87,
    "riskTier": "LOW",
    "eligibleForCyber": true
  },
  "complianceStatus": {
    "naic": "Compliant",
    "hipaa": "Review Required",
    "gdpr": "Compliant"
  }
}
```

---

## Data Models

### AuditRequest
```typescript
interface AuditRequest {
  url: string;  // Required: URL of AI system to audit
}
```

### AuditResponse
```typescript
interface AuditResponse {
  url: string;
  timestamp: string;  // ISO 8601 format
  modules: {
    aiData: AIData;
    accessibility: Accessibility;
    security: Security;
    stress: Stress;
    nist: NIST;
  };
  insuranceReadiness: InsuranceReadiness;
  vaultId: string;  // UUID
}
```

### AIData (Module A)
```typescript
interface AIData {
  hasLogging: boolean;
  modelType: string;
  biasScore: number;  // 0-100
  vulnerabilities: string[];
  compliance: {
    hasAuditTrail: boolean;
    hasVersionControl: boolean;
    hasRollbackCapability: boolean;
  };
}
```

### Accessibility (Module B)
```typescript
interface Accessibility {
  wcagScore: number;  // 0-100
  violations: string[];
  level: "A" | "AA" | "AAA";
  recommendations: string[];
}
```

### Security (Module C)
```typescript
interface Security {
  sslValid: boolean;
  encryption: string;  // e.g., "TLS 1.3"
  exposedEndpoints: number;
  dataProtection: {
    hasEncryptionAtRest: boolean;
    hasEncryptionInTransit: boolean;
    hasAccessControls: boolean;
    gdprCompliant: boolean;
  };
}
```

### Stress (Module D)
```typescript
interface Stress {
  jailbreakResistance: number;  // 0-100
  hallucinationRate: number;  // percentage
  uptime: number;  // percentage
  responseTime: number;  // milliseconds
  concurrentUsers: number;
}
```

### NIST (Module E)
```typescript
interface NIST {
  govern: "Complete" | "Partial" | "In Progress";
  map: "Complete" | "Partial" | "In Progress";
  measure: "Complete" | "Partial" | "In Progress";
  manage: "Complete" | "Partial" | "In Progress";
}
```

### InsuranceReadiness
```typescript
interface InsuranceReadiness {
  overall: number;  // 0-100
  riskTier: "LOW" | "MEDIUM" | "HIGH";
  eligibleForCyber: boolean;  // Score >= 75
  eligibleForEO: boolean;  // Score >= 70
  eligibleForGL: boolean;  // Score >= 65
  breakdown: {
    ai: number;
    accessibility: number;
    security: number;
    stress: number;
    nist: number;
  };
}
```

---

## Rate Limiting

**Current**: No rate limiting (development)  
**Production**: 
- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour
- Enterprise: Unlimited

Rate limit headers (future):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1639136400
```

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Additional context (optional)",
  "code": "ERROR_CODE (optional)"
}
```

**Common Error Codes**:
- `MISSING_URL`: URL parameter not provided
- `INVALID_URL`: URL format is invalid
- `AUDIT_TIMEOUT`: Audit took too long to complete
- `MODULE_FAILURE`: One or more modules failed
- `VAULT_ERROR`: Evidence vault storage failed

---

## Webhooks (Future)

**POST** `YOUR_WEBHOOK_URL`

Receive notifications when audits complete.

**Payload**:
```json
{
  "event": "audit.completed",
  "timestamp": "2025-12-10T19:00:00.000Z",
  "data": {
    "vaultId": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com/ai-system",
    "riskTier": "LOW",
    "overall": 87
  }
}
```

---

## SDK Support

### JavaScript/TypeScript
```bash
npm install @infinitysoul/ais-sdk
```

```typescript
import { InfinitySoulAIS } from '@infinitysoul/ais-sdk';

const client = new InfinitySoulAIS({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.infinitysoulais.com'
});

const result = await client.audit('https://example.com/ai-system');
console.log(result.insuranceReadiness.overall);
```

### Python
```bash
pip install infinitysoul-ais
```

```python
from infinitysoul import AISClient

client = AISClient(api_key='YOUR_API_KEY')
result = client.audit('https://example.com/ai-system')
print(result.insurance_readiness.overall)
```

---

## Testing

### Postman Collection
Import our Postman collection: [Download Link]

### cURL Examples

**Basic Audit**:
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://openai.com"}'
```

**With jq for pretty output**:
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://openai.com"}' | jq .
```

---

## Changelog

### v1.2.0 (December 2025)
- Added health check endpoint
- Enhanced error handling
- Added Module F, G, H
- Improved scoring breakdown

### v1.1.0 (December 2025)
- Initial release
- Basic audit functionality
- 5 core modules (A-E)

---

**Last Updated**: December 2025  
**API Version**: 1.2.0  
**Support**: api-support@infinitysoulais.com
