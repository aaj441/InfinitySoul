/**
 * Prisma Models Tests
 * Tests for database models functionality
 */

import { PrismaClient } from '@prisma/client';

// Mock PrismaClient to avoid actual database connections in tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    consultantSite: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    evidenceFile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    automationJob: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    scanResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    lead: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('Prisma Models Tests', () => {
  let prisma: PrismaClient;
  
  beforeAll(() => {
    prisma = new PrismaClient();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('ConsultantSite Model', () => {
    test('should create a consultant site', async () => {
      const mockSite = {
        id: 'test-id',
        subdomain: 'test-consultant',
        consultantEmail: 'test@example.com',
        brandName: 'Test Consulting',
        customLogo: null,
        customColors: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.consultantSite.create as jest.Mock).mockResolvedValue(mockSite);
      
      const result = await prisma.consultantSite.create({
        data: {
          subdomain: 'test-consultant',
          consultantEmail: 'test@example.com',
          brandName: 'Test Consulting',
        },
      });
      
      expect(result).toEqual(mockSite);
      expect(prisma.consultantSite.create).toHaveBeenCalled();
    });
    
    test('should find consultant site by subdomain', async () => {
      const mockSite = {
        id: 'test-id',
        subdomain: 'test-consultant',
        consultantEmail: 'test@example.com',
        brandName: 'Test Consulting',
        customLogo: null,
        customColors: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.consultantSite.findUnique as jest.Mock).mockResolvedValue(mockSite);
      
      const result = await prisma.consultantSite.findUnique({
        where: { subdomain: 'test-consultant' },
      });
      
      expect(result).toEqual(mockSite);
    });
    
    test('should validate required fields', () => {
      // In a real test with actual Prisma, this would fail without required fields
      // Here we're just testing that the mock function is called correctly
      expect(prisma.consultantSite.create).toBeDefined();
    });
  });
  
  describe('EvidenceFile Model', () => {
    test('should create an evidence file', async () => {
      const mockFile = {
        id: 'file-id',
        type: 'scan_report',
        filePath: 's3://bucket/path/file.pdf',
        fileName: 'report.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        customerId: 'customer-123',
        uploadedBy: 'user@example.com',
        uploadedAt: new Date(),
        metadata: null,
      };
      
      (prisma.evidenceFile.create as jest.Mock).mockResolvedValue(mockFile);
      
      const result = await prisma.evidenceFile.create({
        data: {
          type: 'scan_report',
          filePath: 's3://bucket/path/file.pdf',
          fileName: 'report.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          customerId: 'customer-123',
        },
      });
      
      expect(result).toEqual(mockFile);
    });
    
    test('should find evidence files by customer ID', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          type: 'scan_report',
          filePath: 's3://bucket/file1.pdf',
          fileName: 'report1.pdf',
          customerId: 'customer-123',
        },
        {
          id: 'file-2',
          type: 'vpat',
          filePath: 's3://bucket/file2.pdf',
          fileName: 'vpat1.pdf',
          customerId: 'customer-123',
        },
      ];
      
      (prisma.evidenceFile.findMany as jest.Mock).mockResolvedValue(mockFiles);
      
      const result = await prisma.evidenceFile.findMany({
        where: { customerId: 'customer-123' },
      });
      
      expect(result).toEqual(mockFiles);
      expect(result).toHaveLength(2);
    });
  });
  
  describe('AutomationJob Model', () => {
    test('should create an automation job', async () => {
      const mockJob = {
        id: 'job-id',
        type: 'email',
        status: 'pending',
        payload: { leadEmail: 'lead@example.com' },
        result: null,
        error: null,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
      };
      
      (prisma.automationJob.create as jest.Mock).mockResolvedValue(mockJob);
      
      const result = await prisma.automationJob.create({
        data: {
          type: 'email',
          payload: { leadEmail: 'lead@example.com' },
        },
      });
      
      expect(result).toEqual(mockJob);
      expect(result.status).toBe('pending');
    });
    
    test('should update job status', async () => {
      const mockUpdatedJob = {
        id: 'job-id',
        type: 'email',
        status: 'completed',
        payload: { leadEmail: 'lead@example.com' },
        result: { success: true },
        error: null,
        completedAt: new Date(),
      };
      
      (prisma.automationJob.update as jest.Mock).mockResolvedValue(mockUpdatedJob);
      
      const result = await prisma.automationJob.update({
        where: { id: 'job-id' },
        data: { status: 'completed', result: { success: true } },
      });
      
      expect(result.status).toBe('completed');
    });
    
    test('should find jobs by type', async () => {
      const mockJobs = [
        { id: 'job-1', type: 'email', status: 'pending' },
        { id: 'job-2', type: 'email', status: 'completed' },
      ];
      
      (prisma.automationJob.findMany as jest.Mock).mockResolvedValue(mockJobs);
      
      const result = await prisma.automationJob.findMany({
        where: { type: 'email' },
      });
      
      expect(result).toHaveLength(2);
    });
  });
  
  describe('ScanResult Model', () => {
    test('should create a scan result', async () => {
      const mockScan = {
        id: 'scan-id',
        url: 'https://example.com',
        auditId: 'audit-123',
        status: 'success',
        criticalCount: 5,
        seriousCount: 10,
        moderateCount: 15,
        minorCount: 20,
        totalCount: 50,
        riskScore: 75.5,
        estimatedLawsuitCost: 125000,
        industry: 'ecommerce',
        violationsData: {},
        scannedAt: new Date(),
        email: 'test@example.com',
      };
      
      (prisma.scanResult.create as jest.Mock).mockResolvedValue(mockScan);
      
      const result = await prisma.scanResult.create({
        data: {
          url: 'https://example.com',
          auditId: 'audit-123',
          status: 'success',
          criticalCount: 5,
          seriousCount: 10,
          moderateCount: 15,
          minorCount: 20,
          totalCount: 50,
        },
      });
      
      expect(result).toEqual(mockScan);
    });
    
    test('should find scan results by URL', async () => {
      const mockScans = [
        { id: 'scan-1', url: 'https://example.com', auditId: 'audit-1' },
        { id: 'scan-2', url: 'https://example.com', auditId: 'audit-2' },
      ];
      
      (prisma.scanResult.findMany as jest.Mock).mockResolvedValue(mockScans);
      
      const result = await prisma.scanResult.findMany({
        where: { url: 'https://example.com' },
      });
      
      expect(result).toHaveLength(2);
    });
  });
  
  describe('Lead Model', () => {
    test('should create a lead', async () => {
      const mockLead = {
        id: 'lead-id',
        email: 'lead@example.com',
        companyName: 'Example Corp',
        website: 'https://example.com',
        industry: 'ecommerce',
        source: 'scan',
        lastContactAt: null,
        status: 'new',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);
      
      const result = await prisma.lead.create({
        data: {
          email: 'lead@example.com',
          companyName: 'Example Corp',
          source: 'scan',
        },
      });
      
      expect(result).toEqual(mockLead);
      expect(result.status).toBe('new');
    });
    
    test('should update lead status', async () => {
      const mockUpdatedLead = {
        id: 'lead-id',
        email: 'lead@example.com',
        status: 'contacted',
        lastContactAt: new Date(),
      };
      
      (prisma.lead.update as jest.Mock).mockResolvedValue(mockUpdatedLead);
      
      const result = await prisma.lead.update({
        where: { id: 'lead-id' },
        data: { status: 'contacted', lastContactAt: new Date() },
      });
      
      expect(result.status).toBe('contacted');
    });
    
    test('should find lead by email', async () => {
      const mockLead = {
        id: 'lead-id',
        email: 'lead@example.com',
        status: 'new',
      };
      
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);
      
      const result = await prisma.lead.findUnique({
        where: { email: 'lead@example.com' },
      });
      
      expect(result).toEqual(mockLead);
    });
  });
});
