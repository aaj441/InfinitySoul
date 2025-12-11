/**
 * Infinity Soul AIS Backend Server
 * 
 * Express API server providing audit orchestration and insurance scoring.
 * Handles AI risk assessments, compliance checks, and evidence vault integration.
 * 
 * @module backend/server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runFullAudit } = require('../api/audit-engine');

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint - returns service status and timestamp.
 * Used by monitoring systems and load balancers.
 * 
 * @route GET /health
 * @returns {Object} status - Service status and current timestamp
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.2.0'
  });
});

/**
 * Main audit endpoint - runs comprehensive AI risk assessment.
 * Orchestrates all audit modules and generates insurance readiness score.
 * 
 * @route POST /api/audit
 * @param {string} req.body.url - URL of the AI system to audit
 * @returns {Object} Complete audit report with scores and recommendations
 */
app.post('/api/audit', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate required parameters
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid URL or AI system name to audit'
      });
    }
    
    // Run comprehensive audit
    const report = await runFullAudit(url);
    res.json(report);
    
  } catch (error) {
    // Log error for debugging (use proper logging service in production)
    if (process.env.NODE_ENV === 'development') {
      console.error('Audit error:', error);
    }
    
    res.status(500).json({ 
      error: 'Audit failed',
      message: 'An error occurred while running the audit. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Partner API endpoint - retrieves audit scores by vault ID.
 * Allows insurance partners to access audit results.
 * 
 * @route GET /api/partner/scores/:vaultId
 * @param {string} req.params.vaultId - Evidence vault identifier
 * @returns {Object} Audit scores and metadata
 * 
 * @todo Implement authentication and authorization
 * @todo Add rate limiting
 * @todo Integrate with evidence vault
 * @see https://github.com/aaj441/InfinitySoul/issues/[CREATE_ISSUE]
 */
app.get('/api/partner/scores/:vaultId', async (req, res) => {
  res.json({ 
    message: 'Partner API coming soon',
    vaultId: req.params.vaultId
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Backend server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Version: 1.2.0`);
});
