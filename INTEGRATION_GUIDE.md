# Integration Guide: New Infrastructure Features

This guide shows how to integrate the new logging, error tracking, and AI services into your existing backend.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Server Integration](#backend-server-integration)
3. [Service Integration](#service-integration)
4. [Testing](#testing)
5. [Deployment](#deployment)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example and fill in your values
cp .env.example .env

# Edit .env and add at minimum:
# - SENTRY_DSN (get from https://sentry.io)
# - Optionally: AI service API keys
```

### 3. Validate Environment

```bash
npm run validate:env
```

### 4. Run Pre-Launch Check

```bash
npm run check:prelaunch
```

---

## Backend Server Integration

### Step 1: Update Imports

Add these imports to the top of `backend/server.ts`:

```typescript
// Environment and configuration
import { validateEnvironment, config, getCorsOrigins } from '../config/environment';

// Logging
import { logger, logStartup, httpLogger, auditLog } from '../utils/logger';

// Error tracking
import {
  initErrorTracking,
  errorHandler,
  asyncHandler,
  ValidationError,
  captureError,
} from '../utils/errorTracking';

// Security
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// AI Services (optional)
import { perplexityClient } from '../services/ai/perplexity';
import { claudeClient } from '../services/ai/claude';
import { openaiClient } from '../services/ai/openai';
```

### Step 2: Initialize on Startup

Replace the current initialization code with:

```typescript
// Validate environment first
try {
  validateEnvironment();
  logger.info('✅ Environment validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

// Initialize error tracking
initErrorTracking();

// Create Express app
const app = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS
app.use(cors({
  origin: getCorsOrigins(),
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(httpLogger);
```

### Step 3: Update Console.log Statements

Replace all `console.log` with `logger`:

```typescript
// OLD:
console.log(`[SCAN] Starting scan for ${fullUrl}`);
console.error('[SCAN ERROR]', error);

// NEW:
logger.info('Starting scan', { url: fullUrl });
logger.error('Scan failed', { error: error.message, url: fullUrl });
```

### Step 4: Replace Try-Catch Error Handling

```typescript
// OLD:
app.post('/api/v1/scan', async (req, res) => {
  try {
    // ... scan logic ...
    return res.json(result);
  } catch (error) {
    console.error('[SCAN ERROR]', error);
    return res.status(500).json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// NEW:
app.post('/api/v1/scan', asyncHandler(async (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url) {
    throw new ValidationError('URL is required');
  }

  logger.info('Scan requested', { url, ip: req.ip });

  // ... scan logic ...

  auditLog('scan_completed', undefined, { url, violations: result.violations.total });

  return res.json(result);
}));
```

### Step 5: Add Error Handler (LAST middleware)

Add this at the END of all routes:

```typescript
// Error handler (must be last)
app.use(errorHandler);
```

### Step 6: Update Server Startup

```typescript
// OLD:
app.listen(PORT, () => {
  console.log(`✅ InfinitySol API running on port ${PORT}`);
});

// NEW:
const server = app.listen(PORT, () => {
  logStartup(PORT);
  logger.info('🔍 Health check available at /health');

  // Log AI service availability
  if (perplexityClient.isAvailable()) {
    logger.info('✅ Perplexity AI: Available');
  }
  if (claudeClient.isAvailable()) {
    logger.info('✅ Claude AI: Available');
  }
  if (openaiClient.isAvailable()) {
    logger.info('✅ OpenAI: Available');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

---

## Service Integration

### Adding AI-Powered Features

You can now enhance your scan results with AI analysis:

```typescript
import { claudeClient } from '../services/ai/claude';

// In your scan endpoint:
if (claudeClient.isAvailable()) {
  try {
    const aiAnalysis = await claudeClient.analyzeViolations(
      violations,
      domain
    );
    result.aiAnalysis = aiAnalysis;
  } catch (error) {
    logger.warn('AI analysis failed', { error: error.message });
    // Continue without AI analysis - non-critical
  }
}
```

### Example: Enhanced Scan Endpoint

```typescript
app.post('/api/v1/scan', asyncHandler(async (req, res) => {
  const { url, email } = req.body;

  if (!url) {
    throw new ValidationError('URL is required');
  }

  logger.info('Scan requested', { url, email, ip: req.ip });

  // Parse domain
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = new URL(fullUrl).hostname;

  // Run WCAG scan
  logger.info('Starting WCAG scan', { domain });
  const violations = await wcagScanner.scan(fullUrl);

  // Calculate scores
  const infinity8Score = calculateInfinity8Score(violations);
  const riskLevel = assessRiskLevel(violations);

  // Optional: Add AI analysis
  let aiInsights = undefined;
  if (claudeClient.isAvailable()) {
    try {
      aiInsights = await claudeClient.assessLegalRisk({
        violations,
        industry: 'general',
      });
      logger.info('AI analysis completed', { domain });
    } catch (error) {
      logger.warn('AI analysis failed', { error: error.message, domain });
    }
  }

  // Store email if provided
  if (email) {
    auditLog('email_captured', undefined, { email, domain });
    logger.info('Email captured', { email, domain });
  }

  // Build response
  const result = {
    status: 'success',
    timestamp: new Date().toISOString(),
    domain,
    violations,
    infinity8Score,
    riskLevel,
    aiInsights, // May be undefined
  };

  auditLog('scan_completed', undefined, {
    domain,
    violationCount: violations.total,
    score: infinity8Score,
  });

  return res.json(result);
}));
```

---

## Testing

### Test Environment Configuration

```bash
npm run validate:env
```

Expected output:
```
✅ Environment validated
```

### Test AI Services

```bash
npm run test:ai
```

This will:
- Test all configured AI services
- Compare outputs for consistency
- Report which services are working

Expected output:
```
🤖 InfinitySol Multi-AI Consistency Test
========================================
Testing AI services...

✅ Perplexity: Success (1234ms)
✅ Claude: Success (2345ms)
⚠️  OpenAI: Not Configured

✅ All tests passed!
```

### Pre-Launch Readiness Check

```bash
npm run check:prelaunch
```

This validates:
- ✅ Environment configuration
- ✅ Logging infrastructure
- ✅ Error tracking setup
- ✅ File structure
- ✅ TypeScript configuration
- ✅ Security settings
- ✅ Build system

### Manual Testing

1. Start the server in development mode:
```bash
npm run dev
```

2. Check logs output - should see structured logging:
```
2025-12-02 10:30:00 [info]: ====================================================
2025-12-02 10:30:00 [info]: 🚀 InfinitySol API Server Starting
2025-12-02 10:30:00 [info]: 📡 Port: 8000
2025-12-02 10:30:00 [info]: 🌍 Environment: development
2025-12-02 10:30:00 [info]: ====================================================
```

3. Test a scan request:
```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "example.com"}'
```

4. Check that errors are logged properly:
```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{}' # Missing URL - should throw ValidationError
```

Expected response:
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "URL is required"
}
```

---

## Deployment

### Pre-Deployment Checklist

1. **Run pre-launch check:**
```bash
npm run check:prelaunch
```
All critical checks must pass.

2. **Set environment variables in production:**
   - Railway: Project Settings → Variables
   - Vercel: Project Settings → Environment Variables

Required for production:
```bash
NODE_ENV=production
PORT=8000
SENTRY_DSN=https://your-sentry-dsn...
FRONTEND_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

3. **Build the project:**
```bash
npm run build
```

4. **Test the production build locally:**
```bash
NODE_ENV=production npm start
```

### Production Deployment

#### Railway (Backend)

1. Connect GitHub repository
2. Set environment variables
3. Deploy will happen automatically

Logs will appear in Railway dashboard with structured format.

#### Vercel (Frontend)

1. Connect GitHub repository
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
3. Deploy

### Post-Deployment Verification

1. **Check Sentry Dashboard**
   - Go to https://sentry.io
   - Verify errors are being captured

2. **Check Logs**
   - Railway: View logs in dashboard
   - Look for structured JSON logs

3. **Test Error Tracking**
   - Trigger an intentional error
   - Verify it appears in Sentry within 1 minute

4. **Monitor Performance**
   - Check Sentry Performance tab
   - Review API response times

---

## Troubleshooting

### "Environment validation failed"

**Problem:** Missing required environment variables

**Solution:**
```bash
# Check what's missing
npm run validate:env

# Copy example and fill in values
cp .env.example .env
# Edit .env with your actual values
```

### "Sentry DSN not configured"

**Problem:** Error tracking won't work without Sentry

**Solution:**
1. Sign up at https://sentry.io (free)
2. Create a new project (Node.js)
3. Copy the DSN
4. Add to .env: `SENTRY_DSN=https://...`

### "AI services not available"

**Problem:** AI features won't work

**Solution:** This is optional. To enable:
1. Sign up for one or more:
   - Perplexity: https://www.perplexity.ai/settings/api
   - Claude: https://console.anthropic.com/
   - OpenAI: https://platform.openai.com/api-keys
2. Add API keys to .env
3. Test: `npm run test:ai`

### Logs not appearing in production

**Problem:** Winston not writing to files

**Solution:**
1. Check `NODE_ENV=production` is set
2. Ensure `logs/` directory permissions
3. Check Railway/Vercel logs for winston errors

### TypeScript compilation errors

**Problem:** `tsc` fails

**Solution:**
```bash
# Check for errors
npm run type-check

# Common fixes:
# 1. Update imports to use absolute paths from root
# 2. Ensure tsconfig.json is in root directory
# 3. Install missing @types packages
```

---

## Next Steps

After integration:

1. ✅ **Run all checks:**
   ```bash
   npm run validate:env
   npm run check:prelaunch
   npm run test:ai  # If AI services configured
   ```

2. ✅ **Test locally:**
   - Start development server
   - Make test requests
   - Check log output
   - Verify errors are structured

3. ✅ **Deploy to staging:**
   - Deploy to Railway/Vercel
   - Test in staging environment
   - Verify Sentry is capturing errors

4. ✅ **Production launch:**
   - Final pre-launch check
   - Deploy to production
   - Monitor Sentry dashboard
   - Watch for errors in first hour

---

## Support

- **Documentation:** See PRE_LAUNCH_AUDIT.md for full checklist
- **Sentry Docs:** https://docs.sentry.io/platforms/node/
- **Winston Docs:** https://github.com/winstonjs/winston
- **AI Service Docs:**
  - Perplexity: https://docs.perplexity.ai/
  - Claude: https://docs.anthropic.com/
  - OpenAI: https://platform.openai.com/docs

---

## Summary of New Features

✅ **Structured Logging** - Winston logger with file rotation
✅ **Error Tracking** - Sentry integration with custom error classes
✅ **Environment Validation** - Joi schema validation on startup
✅ **Multi-AI Support** - Perplexity, Claude, and OpenAI integrations
✅ **Security** - Helmet, rate limiting, CORS configuration
✅ **Testing Scripts** - AI consistency testing, pre-launch checks
✅ **TypeScript Config** - Proper compilation settings
✅ **Production Ready** - Graceful shutdown, audit logging

**You are now ready for production deployment!** 🚀
