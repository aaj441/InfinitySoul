import { storage } from "./db-storage";
import { seedVerticalInsights } from "./services/industry-insights";

export async function seedData() {
  // Seed vertical insights first
  await seedVerticalInsights();
  // Create sample prospects
  const prospect1 = await storage.createProspect({
    company: "TechCorp Inc",
    website: "https://techcorp.example.com",
    industry: "Healthcare",
    employees: "500-1000",
    revenue: "$50M+",
    icpScore: 92,
    violations: 67,
    violationSeverity: "Critical",
    status: "active",
    riskLevel: "high-risk",
    currentTouch: "Touch 4/8",
    nextTouch: "Phone Call - Today 2pm",
    nextTouchDate: new Date(),
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  const prospect2 = await storage.createProspect({
    company: "FinServe Co",
    website: "https://finserve.example.com",
    industry: "Finance",
    employees: "1000+",
    revenue: "$100M+",
    icpScore: 88,
    violations: 54,
    violationSeverity: "Critical",
    status: "active",
    riskLevel: "high-risk",
    currentTouch: "Touch 2/8",
    nextTouch: "Email - Tomorrow 10am",
    nextTouchDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  const prospect3 = await storage.createProspect({
    company: "EduLearn",
    website: "https://edulearn.example.com",
    industry: "Education",
    employees: "200-500",
    revenue: "$10M-50M",
    icpScore: 76,
    violations: 38,
    violationSeverity: "Critical",
    status: "active",
    riskLevel: "medium-risk",
    currentTouch: "Touch 6/8",
    nextTouch: "LinkedIn - Friday",
    nextTouchDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  await storage.createProspect({
    company: "Acme Corp",
    website: "https://acme.example.com",
    industry: "E-commerce",
    employees: "50-200",
    revenue: "$5M-10M",
    icpScore: 67,
    violations: 23,
    status: "active",
    riskLevel: "medium-risk",
    currentTouch: "Touch 3/8",
    nextTouch: "Email - Next Monday",
    nextTouchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  await storage.createProspect({
    company: "MedSupply Co",
    website: "https://medsupply.example.com",
    industry: "Healthcare",
    employees: "100-200",
    revenue: "$5M-10M",
    icpScore: 54,
    violations: 15,
    status: "paused",
    riskLevel: "medium-risk",
    nextTouch: "On hold",
    lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  });

  await storage.createProspect({
    company: "Legal Services LLC",
    website: "https://legalservices.example.com",
    industry: "Legal",
    employees: "10-50",
    revenue: "$1M-5M",
    icpScore: 41,
    violations: 6,
    status: "completed",
    riskLevel: "low-risk",
    nextTouch: "Completed",
    lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  // Create sample violations for prospects
  await storage.createViolation({
    prospectId: prospect1.id,
    type: "Missing Alt Text",
    severity: "Critical",
    wcagLevel: "A",
    element: "img.hero-image",
    description: "Image missing alternative text for screen readers",
  });

  await storage.createViolation({
    prospectId: prospect1.id,
    type: "Color Contrast",
    severity: "High",
    wcagLevel: "AA",
    element: "button.primary",
    description: "Insufficient color contrast ratio (2.8:1, requires 4.5:1)",
  });

  await storage.createViolation({
    prospectId: prospect2.id,
    type: "Keyboard Navigation",
    severity: "Critical",
    wcagLevel: "A",
    element: "nav.dropdown",
    description: "Dropdown menu not accessible via keyboard",
  });

  // Create sample triggers
  await storage.createTrigger({
    type: "lawsuit",
    title: "Competitor sued",
    description: "AirBnb sued for $450K (same violations as 3 of your prospects)",
    companyName: "AirBnb",
    industry: "E-commerce",
    similarity: 87,
    isActive: true,
  });

  await storage.createTrigger({
    type: "redesign",
    title: "TechCorp.com",
    description: "Violations increased from 42 → 67 after redesign",
    prospectId: prospect1.id,
    isActive: true,
  });

  await storage.createTrigger({
    type: "funding",
    title: "StartupX ($15M Series A)",
    description: "Budget now available for accessibility compliance",
    companyName: "StartupX",
    industry: "SaaS",
    isActive: true,
  });

  // Create sample analytics data
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (4 - i) * 7);
    
    await storage.createAnalytics({
      date,
      activeProspects: 142 + i * 20,
      emailsSent: 50 + i * 10,
      emailsOpened: Math.round((50 + i * 10) * (0.35 + i * 0.05)),
      emailsReplied: Math.round((50 + i * 10) * (0.08 + i * 0.03)),
      demoBookings: 12 + i * 6,
      avgIcpScore: 70 + i * 2,
    });
  }

  console.log("✅ Seed data created successfully");
}
