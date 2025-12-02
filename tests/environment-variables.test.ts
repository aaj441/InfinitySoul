/**
 * Environment Variables Tests
 * Tests for environment variable configuration and validation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

describe('Environment Variables Tests', () => {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  describe('.env.example File', () => {
    test('should exist', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });
    
    test('should be readable', () => {
      expect(() => {
        fs.readFileSync(envExamplePath, 'utf-8');
      }).not.toThrow();
    });
  });
  
  describe('Required Environment Variables', () => {
    let envContent: string;
    
    beforeAll(() => {
      envContent = fs.readFileSync(envExamplePath, 'utf-8');
    });
    
    test('should contain DATABASE_URL', () => {
      expect(envContent).toContain('DATABASE_URL');
      expect(envContent).toMatch(/DATABASE_URL\s*=/);
    });
    
    test('should contain CONSULTANT_SITE_ENABLED', () => {
      expect(envContent).toContain('CONSULTANT_SITE_ENABLED');
      expect(envContent).toMatch(/CONSULTANT_SITE_ENABLED\s*=/);
    });
    
    test('should contain CONSULTANT_BASE_DOMAIN', () => {
      expect(envContent).toContain('CONSULTANT_BASE_DOMAIN');
      expect(envContent).toMatch(/CONSULTANT_BASE_DOMAIN\s*=/);
    });
    
    test('should contain S3_BUCKET_NAME', () => {
      expect(envContent).toContain('S3_BUCKET_NAME');
      expect(envContent).toMatch(/S3_BUCKET_NAME\s*=/);
    });
    
    test('should contain S3_REGION', () => {
      expect(envContent).toContain('S3_REGION');
      expect(envContent).toMatch(/S3_REGION\s*=/);
    });
    
    test('should contain S3_ACCESS_KEY', () => {
      expect(envContent).toContain('S3_ACCESS_KEY');
      expect(envContent).toMatch(/S3_ACCESS_KEY\s*=/);
    });
    
    test('should contain S3_SECRET_KEY', () => {
      expect(envContent).toContain('S3_SECRET_KEY');
      expect(envContent).toMatch(/S3_SECRET_KEY\s*=/);
    });
    
    test('should contain REDIS_URL', () => {
      expect(envContent).toContain('REDIS_URL');
      expect(envContent).toMatch(/REDIS_URL\s*=/);
    });
    
    test('should contain EMAIL_QUEUE_ENABLED', () => {
      expect(envContent).toContain('EMAIL_QUEUE_ENABLED');
      expect(envContent).toMatch(/EMAIL_QUEUE_ENABLED\s*=/);
    });
    
    test('should contain VPAT_GENERATION_ENABLED', () => {
      expect(envContent).toContain('VPAT_GENERATION_ENABLED');
      expect(envContent).toMatch(/VPAT_GENERATION_ENABLED\s*=/);
    });
  });
  
  describe('Environment Variable Formats', () => {
    let envContent: string;
    
    beforeAll(() => {
      envContent = fs.readFileSync(envExamplePath, 'utf-8');
    });
    
    test('DATABASE_URL should have PostgreSQL format example', () => {
      expect(envContent).toMatch(/DATABASE_URL.*postgresql:\/\//);
    });
    
    test('S3_REGION should have AWS region example', () => {
      expect(envContent).toMatch(/S3_REGION.*us-/);
    });
    
    test('REDIS_URL should have Redis format example', () => {
      expect(envContent).toMatch(/REDIS_URL.*redis:\/\//);
    });
    
    test('Boolean variables should have true/false values', () => {
      const booleanVars = [
        'CONSULTANT_SITE_ENABLED',
        'EMAIL_QUEUE_ENABLED',
        'VPAT_GENERATION_ENABLED'
      ];
      
      booleanVars.forEach(varName => {
        const match = envContent.match(new RegExp(`${varName}\\s*=\\s*(true|false)`, 'i'));
        expect(match).not.toBeNull();
      });
    });
  });
  
  describe('Environment Variable Documentation', () => {
    let envContent: string;
    
    beforeAll(() => {
      envContent = fs.readFileSync(envExamplePath, 'utf-8');
    });
    
    test('should have section headers', () => {
      expect(envContent).toMatch(/={2,}/); // Contains section dividers
      expect(envContent).toMatch(/#.*DATABASE/i);
      expect(envContent).toMatch(/#.*CONSULTANT/i);
      expect(envContent).toMatch(/#.*EVIDENCE/i);
      expect(envContent).toMatch(/#.*AUTOMATION/i);
    });
    
    test('should have comments explaining variables', () => {
      const commentLines = envContent.split('\n').filter(line => line.trim().startsWith('#'));
      expect(commentLines.length).toBeGreaterThan(10);
    });
    
    test('should not contain actual sensitive values', () => {
      // Check that no real API keys or passwords are in .env.example
      expect(envContent).not.toMatch(/sk-[a-zA-Z0-9]{32,}/); // OpenAI key pattern
      expect(envContent).not.toMatch(/[A-Za-z0-9]{40}/); // AWS key pattern
      // Note: Example passwords like "password@localhost" are acceptable in .env.example
    });
  });
  
  describe('Environment Variable Validation', () => {
    test('should load environment variables from .env', () => {
      const envPath = path.join(__dirname, '..', '.env');
      
      if (fs.existsSync(envPath)) {
        const config = dotenv.config({ path: envPath });
        expect(config.error).toBeUndefined();
      } else {
        // .env might not exist in test environment, which is fine
        expect(true).toBe(true);
      }
    });
    
    test('test environment should have required variables set', () => {
      // These are set in tests/setup.ts
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.CONSULTANT_SITE_ENABLED).toBe('true');
      expect(process.env.S3_BUCKET_NAME).toBe('test-bucket');
      expect(process.env.REDIS_URL).toBeDefined();
    });
  });
  
  describe('Environment Variable Security', () => {
    test('.env should be in .gitignore', () => {
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        expect(gitignoreContent).toMatch(/\.env\s*$/m);
      }
    });
    
    test('.env.example should not have .gitignore entry', () => {
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        // .env.example should NOT be ignored (should be committed)
        expect(gitignoreContent).not.toMatch(/\.env\.example/);
      }
    });
  });
  
  describe('Database URL Parsing', () => {
    test('should parse valid PostgreSQL URL', () => {
      const testUrl = 'postgresql://user:password@localhost:5432/infinitysol';
      const url = new URL(testUrl);
      
      expect(url.protocol).toBe('postgresql:');
      expect(url.hostname).toBe('localhost');
      expect(url.port).toBe('5432');
      expect(url.pathname).toBe('/infinitysol');
    });
    
    test('should parse PostgreSQL URL with query params', () => {
      const testUrl = 'postgresql://user:password@localhost:5432/infinitysol?schema=public';
      const url = new URL(testUrl);
      
      expect(url.searchParams.get('schema')).toBe('public');
    });
  });
  
  describe('Redis URL Parsing', () => {
    test('should parse valid Redis URL', () => {
      const testUrl = 'redis://localhost:6379';
      const url = new URL(testUrl);
      
      expect(url.protocol).toBe('redis:');
      expect(url.hostname).toBe('localhost');
      expect(url.port).toBe('6379');
    });
    
    test('should parse Redis URL with authentication', () => {
      const testUrl = 'redis://default:password@localhost:6379';
      const url = new URL(testUrl);
      
      expect(url.username).toBe('default');
      expect(url.password).toBe('password');
    });
  });
  
  describe('S3 Configuration Validation', () => {
    test('should have valid S3 bucket name format in example', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const bucketMatch = envContent.match(/S3_BUCKET_NAME\s*=\s*([^\s#]+)/);
      
      if (bucketMatch) {
        const bucketName = bucketMatch[1];
        // S3 bucket names must be lowercase, no underscores
        expect(bucketName).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
      }
    });
    
    test('should have valid AWS region format in example', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const regionMatch = envContent.match(/S3_REGION\s*=\s*([^\s#]+)/);
      
      if (regionMatch) {
        const region = regionMatch[1];
        // AWS regions follow pattern: us-east-1, eu-west-2, etc.
        expect(region).toMatch(/^[a-z]{2}-[a-z]+-\d+$/);
      }
    });
  });
  
  describe('Feature Flags', () => {
    test('should parse boolean environment variables correctly', () => {
      const testCases = [
        { value: 'true', expected: true },
        { value: 'TRUE', expected: true },
        { value: 'false', expected: false },
        { value: 'FALSE', expected: false },
        { value: '1', expected: true },
        { value: '0', expected: false },
        { value: '', expected: false },
      ];
      
      testCases.forEach(({ value, expected }) => {
        const result = value.toLowerCase() === 'true' || value === '1';
        expect(result).toBe(expected);
      });
    });
  });
});
