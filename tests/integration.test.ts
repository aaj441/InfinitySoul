/**
 * Integration Tests
 * End-to-end tests for the full consolidation workflow
 */

import request from 'supertest';
import express, { Express } from 'express';
import consultantRouter from '../backend/routes/consultant';
import evidenceRouter from '../backend/routes/evidence';
import automationRouter from '../backend/routes/automation';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration Tests - Full Stack', () => {
  let app: Express;
  
  beforeAll(() => {
    // Set up Express app with all routes
    app = express();
    app.use(express.json());
    app.use('/api/consultant', consultantRouter);
    app.use('/api/evidence', evidenceRouter);
    app.use('/api/automation', automationRouter);
  });
  
  describe('Consultant Site Workflow', () => {
    let subdomain: string;
    
    test('should create a new consultant site', async () => {
      const response = await request(app)
        .post('/api/consultant/create')
        .send({
          consultantEmail: 'integration@test.com',
          brandName: 'Integration Test Consulting',
          subdomain: 'integration-test',
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('siteId');
      expect(response.body).toHaveProperty('subdomain');
      
      subdomain = 'integration-test';
    });
    
    test('should retrieve the created consultant site', async () => {
      const response = await request(app)
        .get(`/api/consultant/${subdomain}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.site).toHaveProperty('subdomain', subdomain);
      expect(response.body.site).toHaveProperty('isActive');
    });
  });
  
  describe('Evidence Vault Workflow', () => {
    const customerId = 'integration-customer-123';
    
    test('should upload evidence file', async () => {
      const response = await request(app)
        .post('/api/evidence/upload')
        .send({
          customerId,
          fileType: 'scan_report',
          fileName: 'integration-scan-report.pdf',
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('fileId');
      expect(response.body).toHaveProperty('filePath');
      expect(response.body.filePath).toContain(customerId);
    });
    
    test('should retrieve evidence files for customer', async () => {
      const response = await request(app)
        .get(`/api/evidence/${customerId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('files');
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });
  
  describe('Automation Workflow', () => {
    let emailJobId: string;
    let vpatJobId: string;
    
    test('should queue email generation job', async () => {
      const response = await request(app)
        .post('/api/automation/email')
        .send({
          leadEmail: 'integration-lead@test.com',
          scanResults: {
            violations: 25,
            criticalCount: 5,
            url: 'https://example.com',
          },
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.message).toContain('queued');
      
      emailJobId = response.body.jobId;
    });
    
    test('should retrieve email job status', async () => {
      const response = await request(app)
        .get(`/api/automation/job/${emailJobId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.job).toHaveProperty('id', emailJobId);
      expect(response.body.job).toHaveProperty('status');
    });
    
    test('should queue VPAT generation job', async () => {
      const response = await request(app)
        .post('/api/automation/vpat')
        .send({
          customerId: 'integration-customer-123',
          scanResults: {
            violations: 25,
            url: 'https://example.com',
          },
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.message).toContain('VPAT');
      
      vpatJobId = response.body.jobId;
    });
    
    test('should retrieve VPAT job status', async () => {
      const response = await request(app)
        .get(`/api/automation/job/${vpatJobId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.job).toHaveProperty('id', vpatJobId);
    });
  });
  
  describe('Combined Workflow - Consultant + Evidence + Automation', () => {
    test('complete workflow: create consultant, upload evidence, generate email', async () => {
      // Step 1: Create consultant site
      const consultantResponse = await request(app)
        .post('/api/consultant/create')
        .send({
          consultantEmail: 'workflow@test.com',
          brandName: 'Workflow Test',
          subdomain: 'workflow-test',
        })
        .expect(200);
      
      expect(consultantResponse.body.success).toBe(true);
      const siteId = consultantResponse.body.siteId;
      
      // Step 2: Upload evidence
      const evidenceResponse = await request(app)
        .post('/api/evidence/upload')
        .send({
          customerId: siteId,
          fileType: 'scan_report',
          fileName: 'workflow-scan.pdf',
        })
        .expect(200);
      
      expect(evidenceResponse.body.success).toBe(true);
      const fileId = evidenceResponse.body.fileId;
      
      // Step 3: Queue email generation
      const automationResponse = await request(app)
        .post('/api/automation/email')
        .send({
          leadEmail: 'workflow-lead@test.com',
          scanResults: {
            violations: 30,
            fileId,
          },
        })
        .expect(200);
      
      expect(automationResponse.body.success).toBe(true);
      expect(automationResponse.body).toHaveProperty('jobId');
    });
  });
  
  describe('Error Handling Integration', () => {
    test('should handle invalid consultant data gracefully', async () => {
      const response = await request(app)
        .post('/api/consultant/create')
        .send({
          // Missing required fields
          consultantEmail: 'test@example.com',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    test('should handle invalid evidence upload gracefully', async () => {
      const response = await request(app)
        .post('/api/evidence/upload')
        .send({
          // Missing required fields
          customerId: 'test',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    test('should handle invalid automation job gracefully', async () => {
      const response = await request(app)
        .post('/api/automation/email')
        .send({
          // Missing scanResults
          leadEmail: 'test@example.com',
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('File Structure Validation', () => {
    test('should have all required directories created by consolidation', () => {
      const requiredDirs = [
        'backend/routes',
        'prisma',
        'automation',
        'evidence-vault/attestations',
        'evidence-vault/reports',
        'evidence-vault/scans',
      ];
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
    
    test('should have all required files created by consolidation', () => {
      const requiredFiles = [
        'backend/routes/consultant.ts',
        'backend/routes/evidence.ts',
        'backend/routes/automation.ts',
        'prisma/schema.prisma',
        'automation/ai-email-generator.ts',
        'automation/vpat-generator.ts',
        'automation/insurance_lead_import.py',
      ];
      
      requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
    
    test('should have updated backend/server.ts with new routes', () => {
      const serverPath = path.join(__dirname, '..', 'backend', 'server.ts');
      const content = fs.readFileSync(serverPath, 'utf-8');
      
      expect(content).toMatch(/import.*consultantRouter/);
      expect(content).toMatch(/import.*evidenceRouter/);
      expect(content).toMatch(/import.*automationRouter/);
      
      expect(content).toMatch(/app\.use\(['"]\/api\/consultant/);
      expect(content).toMatch(/app\.use\(['"]\/api\/evidence/);
      expect(content).toMatch(/app\.use\(['"]\/api\/automation/);
    });
  });
  
  describe('Prisma Schema Validation', () => {
    test('should have valid Prisma schema with all models', () => {
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
      const content = fs.readFileSync(schemaPath, 'utf-8');
      
      const requiredModels = [
        'ConsultantSite',
        'EvidenceFile',
        'AutomationJob',
        'ScanResult',
        'Lead',
      ];
      
      requiredModels.forEach(model => {
        expect(content).toContain(`model ${model}`);
      });
      
      // Check for required fields
      expect(content).toContain('@id');
      expect(content).toContain('@unique');
      expect(content).toContain('@default');
      expect(content).toContain('@@map');
      expect(content).toContain('@@index');
    });
  });
  
  describe('Environment Configuration Integration', () => {
    test('should have all required environment variables defined', () => {
      const envPath = path.join(__dirname, '..', '.env.example');
      const content = fs.readFileSync(envPath, 'utf-8');
      
      const requiredVars = [
        'DATABASE_URL',
        'CONSULTANT_SITE_ENABLED',
        'CONSULTANT_BASE_DOMAIN',
        'S3_BUCKET_NAME',
        'S3_REGION',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
        'REDIS_URL',
        'EMAIL_QUEUE_ENABLED',
        'VPAT_GENERATION_ENABLED',
      ];
      
      requiredVars.forEach(varName => {
        expect(content).toContain(varName);
      });
    });
  });
  
  describe('Consolidation Script Validation', () => {
    test('should have executable consolidation script', () => {
      const scriptPath = path.join(__dirname, '..', 'INFINITYSOL_CONSOLIDATION.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      const stats = fs.statSync(scriptPath);
      expect((stats.mode & parseInt('111', 8)) > 0).toBe(true);
    });
    
    test('consolidation script should have all phases', () => {
      const scriptPath = path.join(__dirname, '..', 'INFINITYSOL_CONSOLIDATION.sh');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      
      expect(content).toContain('phase1_extract');
      expect(content).toContain('phase2_update_structure');
      expect(content).toContain('phase3_verification');
      expect(content).toContain('phase4_reports');
    });
  });
});
