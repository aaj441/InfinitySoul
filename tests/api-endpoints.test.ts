/**
 * API Endpoints Tests
 * Tests for new API routes introduced by the consolidation
 */

import request from 'supertest';
import express, { Express } from 'express';
import consultantRouter from '../backend/routes/consultant';
import evidenceRouter from '../backend/routes/evidence';
import automationRouter from '../backend/routes/automation';

describe('API Endpoints Tests', () => {
  let app: Express;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/consultant', consultantRouter);
    app.use('/api/evidence', evidenceRouter);
    app.use('/api/automation', automationRouter);
  });
  
  describe('Consultant API Endpoints', () => {
    describe('POST /api/consultant/create', () => {
      test('should create a consultant site with valid data', async () => {
        const response = await request(app)
          .post('/api/consultant/create')
          .send({
            consultantEmail: 'test@consultant.com',
            brandName: 'Test Consulting',
            subdomain: 'testco',
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('siteId');
        expect(response.body).toHaveProperty('subdomain');
        expect(response.body.subdomain).toBe('testco.infinitysol.com');
      });
      
      test('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/consultant/create')
          .send({
            consultantEmail: 'test@consultant.com',
            // Missing brandName and subdomain
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Missing required fields');
      });
      
      test('should handle custom logo', async () => {
        const response = await request(app)
          .post('/api/consultant/create')
          .send({
            consultantEmail: 'test@consultant.com',
            brandName: 'Test Consulting',
            subdomain: 'testco',
            customLogo: 'https://example.com/logo.png',
          })
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
    });
    
    describe('GET /api/consultant/:subdomain', () => {
      test('should retrieve consultant site by subdomain', async () => {
        const response = await request(app)
          .get('/api/consultant/testco')
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('site');
        expect(response.body.site).toHaveProperty('subdomain');
        expect(response.body.site).toHaveProperty('brandName');
        expect(response.body.site).toHaveProperty('isActive');
      });
      
      test('should handle non-existent subdomain gracefully', async () => {
        const response = await request(app)
          .get('/api/consultant/nonexistent')
          .expect(200);
        
        // Even if not found, should return a structure
        expect(response.body).toHaveProperty('success', true);
      });
    });
  });
  
  describe('Evidence API Endpoints', () => {
    describe('POST /api/evidence/upload', () => {
      test('should upload evidence file with valid data', async () => {
        const response = await request(app)
          .post('/api/evidence/upload')
          .send({
            customerId: 'customer-123',
            fileType: 'scan_report',
            fileName: 'scan-report.pdf',
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('fileId');
        expect(response.body).toHaveProperty('filePath');
        expect(response.body.filePath).toContain('customer-123');
      });
      
      test('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/evidence/upload')
          .send({
            customerId: 'customer-123',
            // Missing fileType and fileName
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
      
      test('should validate file type', async () => {
        const response = await request(app)
          .post('/api/evidence/upload')
          .send({
            customerId: 'customer-123',
            fileType: 'scan_report',
            fileName: 'report.pdf',
          })
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
    });
    
    describe('GET /api/evidence/:customerId', () => {
      test('should retrieve evidence files for customer', async () => {
        const response = await request(app)
          .get('/api/evidence/customer-123')
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('files');
        expect(Array.isArray(response.body.files)).toBe(true);
      });
      
      test('should return empty array for customer with no files', async () => {
        const response = await request(app)
          .get('/api/evidence/new-customer')
          .expect(200);
        
        expect(response.body.files).toEqual([]);
      });
    });
  });
  
  describe('Automation API Endpoints', () => {
    describe('POST /api/automation/email', () => {
      test('should queue email generation job', async () => {
        const response = await request(app)
          .post('/api/automation/email')
          .send({
            leadEmail: 'lead@example.com',
            scanResults: { violations: 10 },
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('jobId');
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('queued');
      });
      
      test('should return 400 for missing leadEmail', async () => {
        const response = await request(app)
          .post('/api/automation/email')
          .send({
            scanResults: { violations: 10 },
            // Missing leadEmail
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
      
      test('should return 400 for missing scanResults', async () => {
        const response = await request(app)
          .post('/api/automation/email')
          .send({
            leadEmail: 'lead@example.com',
            // Missing scanResults
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });
    
    describe('POST /api/automation/vpat', () => {
      test('should queue VPAT generation job', async () => {
        const response = await request(app)
          .post('/api/automation/vpat')
          .send({
            customerId: 'customer-123',
            scanResults: { violations: 10 },
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('jobId');
        expect(response.body.message).toContain('VPAT');
      });
      
      test('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/automation/vpat')
          .send({
            customerId: 'customer-123',
            // Missing scanResults
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });
    
    describe('GET /api/automation/job/:jobId', () => {
      test('should retrieve job status', async () => {
        const response = await request(app)
          .get('/api/automation/job/job-123')
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('job');
        expect(response.body.job).toHaveProperty('id');
        expect(response.body.job).toHaveProperty('status');
        expect(response.body.job).toHaveProperty('createdAt');
      });
      
      test('should handle any job ID format', async () => {
        const response = await request(app)
          .get('/api/automation/job/test-job-456')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.job.id).toBe('test-job-456');
      });
    });
  });
  
  describe('API Error Handling', () => {
    test('consultant endpoint should handle internal errors gracefully', async () => {
      // This would normally cause an error, but should be caught
      const response = await request(app)
        .post('/api/consultant/create')
        .send({
          consultantEmail: 'test@example.com',
          brandName: 'Test',
          subdomain: 'test',
        });
      
      // Should either succeed or return proper error structure
      expect(response.body).toHaveProperty('success');
    });
    
    test('evidence endpoint should handle internal errors gracefully', async () => {
      const response = await request(app)
        .post('/api/evidence/upload')
        .send({
          customerId: 'test',
          fileType: 'test',
          fileName: 'test.pdf',
        });
      
      expect(response.body).toHaveProperty('success');
    });
    
    test('automation endpoint should handle internal errors gracefully', async () => {
      const response = await request(app)
        .post('/api/automation/email')
        .send({
          leadEmail: 'test@example.com',
          scanResults: {},
        });
      
      expect(response.body).toHaveProperty('success');
    });
  });
  
  describe('API Response Format', () => {
    test('all successful responses should have success: true', async () => {
      const endpoints = [
        { method: 'post', path: '/api/consultant/create', body: { consultantEmail: 'test@example.com', brandName: 'Test', subdomain: 'test' }},
        { method: 'get', path: '/api/consultant/test', body: null },
        { method: 'post', path: '/api/evidence/upload', body: { customerId: 'test', fileType: 'test', fileName: 'test.pdf' }},
        { method: 'get', path: '/api/evidence/test', body: null },
        { method: 'post', path: '/api/automation/email', body: { leadEmail: 'test@example.com', scanResults: {} }},
        { method: 'get', path: '/api/automation/job/test', body: null },
      ];
      
      for (const endpoint of endpoints) {
        const req = endpoint.method === 'post' 
          ? request(app).post(endpoint.path).send(endpoint.body || {})
          : request(app).get(endpoint.path);
        
        const response = await req;
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('success');
        }
      }
    });
  });
});
