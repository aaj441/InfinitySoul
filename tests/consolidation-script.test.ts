/**
 * Consolidation Script Tests
 * Tests for INFINITYSOL_CONSOLIDATION.sh script functionality
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

// execAsync for potential future use
promisify(exec);

describe('INFINITYSOL_CONSOLIDATION.sh Script Tests', () => {
  const scriptPath = path.join(__dirname, '..', 'INFINITYSOL_CONSOLIDATION.sh');
  
  describe('Script Existence and Permissions', () => {
    test('should exist and be executable', async () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      const stats = fs.statSync(scriptPath);
      // Check if file has execute permission
      expect((stats.mode & parseInt('111', 8)) > 0).toBe(true);
    });
    
    test('should be a valid bash script', async () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('INFINITYSOL CONSOLIDATION SCRIPT');
    });
  });

  describe('Script Output Structure', () => {
    test('should create required directories', () => {
      const requiredDirs = [
        'consultant-site/pages',
        'consultant-site/components',
        'consultant-site/legal',
        'evidence-vault/attestations',
        'evidence-vault/reports',
        'evidence-vault/scans',
        'automation',
        'prisma',
        'backend/routes'
      ];
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
    
    test('should create route files', () => {
      const routeFiles = [
        'backend/routes/consultant.ts',
        'backend/routes/evidence.ts',
        'backend/routes/automation.ts'
      ];
      
      routeFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
    
    test('should create Prisma schema', () => {
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
      expect(fs.existsSync(schemaPath)).toBe(true);
      
      const content = fs.readFileSync(schemaPath, 'utf-8');
      expect(content).toContain('model ConsultantSite');
      expect(content).toContain('model EvidenceFile');
      expect(content).toContain('model AutomationJob');
      expect(content).toContain('model ScanResult');
      expect(content).toContain('model Lead');
    });
    
    test('should create automation files', () => {
      const automationFiles = [
        'automation/ai-email-generator.ts',
        'automation/vpat-generator.ts',
        'automation/insurance_lead_import.py'
      ];
      
      automationFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Script Configuration', () => {
    test('should have proper error handling configuration', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('set -euo pipefail');
      expect(content).toContain('trap');
      expect(content).toContain('error_handler');
    });
    
    test('should have rollback functionality', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('ROLLBACK_ACTIONS');
      expect(content).toContain('rollback()');
      expect(content).toContain('add_rollback_action');
    });
    
    test('should have logging functionality', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('log_success');
      expect(content).toContain('log_error');
      expect(content).toContain('log_warning');
      expect(content).toContain('log_info');
    });
  });

  describe('Validation Functions', () => {
    test('should validate prerequisites', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('check_prerequisites');
      expect(content).toContain('node');
      expect(content).toContain('npm');
      expect(content).toContain('git');
    });
    
    test('should check Node.js version', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('node -v');
      expect(content).toContain('node_version');
    });
    
    test('should check disk space', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('df -m');
      expect(content).toContain('available_space');
    });
  });

  describe('Phase Execution', () => {
    test('should define all phases', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('phase1_extract');
      expect(content).toContain('phase2_update_structure');
      expect(content).toContain('phase3_verification');
      expect(content).toContain('phase4_reports');
    });
    
    test('should create backup before execution', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('create_backup');
      expect(content).toContain('BACKUP_DIR');
    });
  });

  describe('Environment Variable Updates', () => {
    test('should add new environment variables to .env.example', () => {
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
        'VPAT_GENERATION_ENABLED'
      ];
      
      requiredVars.forEach(varName => {
        expect(content).toContain(varName);
      });
    });
  });
});
