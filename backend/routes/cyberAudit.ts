/**
 * Cyber Audit API Routes
 * Endpoints for running and retrieving cyber security audits
 */

import express, { Request, Response } from 'express';
import {
  runCyberAudit,
  getAuditResult,
  formatAuditForEmail,
  generateFollowUpEmail,
  CyberAuditRequest
} from '../services/cyberAudit';

const router = express.Router();

/**
 * POST /api/cyber-audit
 * Run a new cyber audit
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { domain, email, businessName, industry } = req.body as CyberAuditRequest;
    
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required'
      });
    }
    
    console.log(`[Cyber Audit] Starting audit for: ${domain}`);
    
    const result = await runCyberAudit({
      domain,
      email,
      businessName,
      industry
    });
    
    if (result.status === 'failed') {
      return res.status(500).json({
        error: result.error,
        auditId: result.auditId
      });
    }
    
    res.json({
      success: true,
      auditId: result.auditId,
      result: result.result,
      reportUrl: result.reportUrl
    });
    
  } catch (error: any) {
    console.error('[Cyber Audit] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/cyber-audit/:auditId
 * Retrieve audit results by ID
 */
router.get('/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    
    if (!auditId || !/^[a-f0-9-]{36}$/i.test(auditId)) {
      return res.status(400).json({
        error: 'Invalid audit ID format'
      });
    }
    
    const result = await getAuditResult(auditId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Audit not found'
      });
    }
    
    res.json({
      success: true,
      result
    });
    
  } catch (error: any) {
    console.error('[Cyber Audit] Error retrieving result:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/cyber-audit/report/:auditId
 * Get formatted email report
 */
router.get('/report/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    
    if (!auditId || !/^[a-f0-9-]{36}$/i.test(auditId)) {
      return res.status(400).json({
        error: 'Invalid audit ID format'
      });
    }
    
    const result = await getAuditResult(auditId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Audit not found'
      });
    }
    
    const emailReport = formatAuditForEmail(result);
    
    res.type('text/plain').send(emailReport);
    
  } catch (error: any) {
    console.error('[Cyber Audit] Error generating report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/cyber-audit/:auditId/follow-up
 * Generate follow-up email content
 */
router.post('/:auditId/follow-up', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const { businessName, contactName } = req.body;
    
    if (!auditId || !/^[a-f0-9-]{36}$/i.test(auditId)) {
      return res.status(400).json({
        error: 'Invalid audit ID format'
      });
    }
    
    if (!businessName || !contactName) {
      return res.status(400).json({
        error: 'Business name and contact name are required'
      });
    }
    
    const result = await getAuditResult(auditId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Audit not found'
      });
    }
    
    const followUpEmail = generateFollowUpEmail(result, businessName, contactName);
    
    res.json({
      success: true,
      email: followUpEmail
    });
    
  } catch (error: any) {
    console.error('[Cyber Audit] Error generating follow-up:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/cyber-audit/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      service: 'cyber-audit',
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Service unavailable',
      message: error.message
    });
  }
});

export default router;
