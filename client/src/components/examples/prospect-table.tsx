import { ProspectTable } from "../prospect-table";

export default function ProspectTableExample() {
  const prospects = [
    {
      id: "1",
      company: "Acme Corp",
      industry: "E-commerce",
      icpScore: 92,
      violations: 23,
      status: "active" as const,
      riskLevel: "high-risk" as const,
      lastContact: "2 days ago",
    },
    {
      id: "2",
      company: "TechStart Inc",
      industry: "SaaS",
      icpScore: 67,
      violations: 12,
      status: "active" as const,
      riskLevel: "medium-risk" as const,
      lastContact: "1 week ago",
    },
    {
      id: "3",
      company: "Global Finance",
      industry: "Financial Services",
      icpScore: 45,
      violations: 8,
      status: "paused" as const,
      riskLevel: "low-risk" as const,
      lastContact: "3 weeks ago",
    },
  ];

  return (
    <div className="p-4">
      <ProspectTable prospects={prospects} />
    </div>
  );
}
