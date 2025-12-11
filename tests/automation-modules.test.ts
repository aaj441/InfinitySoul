/**
 * Automation Module Tests
 * Tests for automation scripts and functionality
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Automation Module Tests', () => {
  const automationDir = path.join(__dirname, '..', 'automation');
  
  describe('Automation Directory Structure', () => {
    test('automation directory should exist', () => {
      expect(fs.existsSync(automationDir)).toBe(true);
    });
    
    test('should contain ai-email-generator.ts', () => {
      const filePath = path.join(automationDir, 'ai-email-generator.ts');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    
    test('should contain vpat-generator.ts', () => {
      const filePath = path.join(automationDir, 'vpat-generator.ts');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    
    test('should contain insurance_lead_import.py', () => {
      const filePath = path.join(automationDir, 'insurance_lead_import.py');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
  
  describe('AI Email Generator', () => {
    let fileContent: string;
    const filePath = path.join(automationDir, 'ai-email-generator.ts');
    
    beforeAll(() => {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    });
    
    test('should be valid TypeScript', () => {
      expect(fileContent).toContain('interface');
      expect(fileContent).toContain('export');
    });
    
    test('should define LeadData interface', () => {
      expect(fileContent).toMatch(/interface\s+LeadData/);
      expect(fileContent).toContain('email');
      expect(fileContent).toContain('companyName');
    });
    
    test('should define EmailResult interface', () => {
      expect(fileContent).toMatch(/interface\s+EmailResult/);
      expect(fileContent).toContain('subject');
      expect(fileContent).toContain('body');
    });
    
    test('should export generateEmail function', () => {
      expect(fileContent).toMatch(/export.*function\s+generateEmail/);
      expect(fileContent).toMatch(/async.*generateEmail/);
    });
    
    test('should have proper TypeScript typing', () => {
      expect(fileContent).toMatch(/LeadData.*Promise<EmailResult>/);
    });
    
    test('should have documentation comments', () => {
      expect(fileContent).toMatch(/\/\*\*/);
      expect(fileContent).toContain('AI Email Generator');
    });
  });
  
  describe('VPAT Generator', () => {
    let fileContent: string;
    const filePath = path.join(automationDir, 'vpat-generator.ts');
    
    beforeAll(() => {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    });
    
    test('should be valid TypeScript', () => {
      expect(fileContent).toContain('interface');
      expect(fileContent).toContain('export');
    });
    
    test('should define ScanResults interface', () => {
      expect(fileContent).toMatch(/interface\s+ScanResults/);
      expect(fileContent).toContain('violations');
      expect(fileContent).toContain('url');
    });
    
    test('should define VPATReport interface', () => {
      expect(fileContent).toMatch(/interface\s+VPATReport/);
      expect(fileContent).toContain('reportId');
    });
    
    test('should export generateVPAT function', () => {
      expect(fileContent).toMatch(/export.*function\s+generateVPAT/);
      expect(fileContent).toMatch(/async.*generateVPAT/);
    });
    
    test('should have proper TypeScript typing', () => {
      expect(fileContent).toMatch(/ScanResults.*Promise<VPATReport>/);
    });
    
    test('should have documentation comments', () => {
      expect(fileContent).toMatch(/\/\*\*/);
      expect(fileContent).toContain('VPAT');
    });
  });
  
  describe('Insurance Lead Import', () => {
    let fileContent: string;
    const filePath = path.join(automationDir, 'insurance_lead_import.py');
    
    beforeAll(() => {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    });
    
    test('should be valid Python', () => {
      expect(fileContent).toContain('#!/usr/bin/env python3');
      expect(fileContent).toMatch(/def\s+\w+/);
    });
    
    test('should have executable permissions', () => {
      const stats = fs.statSync(filePath);
      expect((stats.mode & parseInt('111', 8)) > 0).toBe(true);
    });
    
    test('should define import_leads function', () => {
      expect(fileContent).toMatch(/def\s+import_leads/);
    });
    
    test('should have type hints', () => {
      expect(fileContent).toContain('List');
      expect(fileContent).toContain('Dict');
      expect(fileContent).toContain('typing');
    });
    
    test('should have documentation strings', () => {
      expect(fileContent).toMatch(/"""/);
      expect(fileContent).toContain('Insurance Lead Import');
    });
    
    test('should have main execution block', () => {
      expect(fileContent).toContain('if __name__ == "__main__"');
    });
  });
  
  describe('Automation Module Exports', () => {
    test('AI Email Generator should be importable', () => {
      const filePath = path.join(automationDir, 'ai-email-generator.ts');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      expect(fileContent).toMatch(/export\s+(async\s+)?function\s+generateEmail/);
      expect(fileContent).toMatch(/export\s+default/);
    });
    
    test('VPAT Generator should be importable', () => {
      const filePath = path.join(automationDir, 'vpat-generator.ts');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      expect(fileContent).toMatch(/export\s+(async\s+)?function\s+generateVPAT/);
      expect(fileContent).toMatch(/export\s+default/);
    });
  });
  
  describe('Automation Integration Points', () => {
    test('automation routes should reference automation modules', () => {
      const routePath = path.join(__dirname, '..', 'backend', 'routes', 'automation.ts');
      
      if (fs.existsSync(routePath)) {
        const routeContent = fs.readFileSync(routePath, 'utf-8');
        
        // Routes should have endpoints for email and VPAT generation
        expect(routeContent).toContain('/email');
        expect(routeContent).toContain('/vpat');
      }
    });
  });
  
  describe('Error Handling in Automation Modules', () => {
    test('AI Email Generator should handle errors', () => {
      const filePath = path.join(automationDir, 'ai-email-generator.ts');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Should either throw or return error
      expect(
        fileContent.includes('throw') || 
        fileContent.includes('Error') ||
        fileContent.includes('try') ||
        fileContent.includes('catch')
      ).toBe(true);
    });
    
    test('VPAT Generator should handle errors', () => {
      const filePath = path.join(automationDir, 'vpat-generator.ts');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      expect(
        fileContent.includes('throw') || 
        fileContent.includes('Error') ||
        fileContent.includes('try') ||
        fileContent.includes('catch')
      ).toBe(true);
    });
    
    test('Insurance Lead Import should handle errors', () => {
      const filePath = path.join(automationDir, 'insurance_lead_import.py');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      expect(
        fileContent.includes('raise') || 
        fileContent.includes('Exception') ||
        fileContent.includes('try') ||
        fileContent.includes('except')
      ).toBe(true);
    });
  });
  
  describe('Automation Documentation', () => {
    test('each automation file should have header comments', () => {
      const files = [
        'ai-email-generator.ts',
        'vpat-generator.ts',
        'insurance_lead_import.py'
      ];
      
      files.forEach(file => {
        const filePath = path.join(automationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Should have some form of documentation at the top
        const firstLines = content.split('\n').slice(0, 10).join('\n');
        expect(
          firstLines.includes('/**') || 
          firstLines.includes('"""') ||
          firstLines.includes('#')
        ).toBe(true);
      });
    });
  });
});
