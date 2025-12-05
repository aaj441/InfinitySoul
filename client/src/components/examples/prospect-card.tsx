import { ProspectCard } from "../prospect-card";

export default function ProspectCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <ProspectCard
        companyName="Acme Corp"
        industry="E-commerce"
        employees="500-1000"
        revenue="$50M+"
        icpScore={92}
        violations={23}
        riskLevel="high-risk"
        status="active"
      />
      <ProspectCard
        companyName="TechStart Inc"
        industry="SaaS"
        employees="50-200"
        revenue="$5M-10M"
        icpScore={67}
        violations={12}
        riskLevel="medium-risk"
        status="active"
      />
      <ProspectCard
        companyName="Global Finance"
        industry="Financial Services"
        employees="1000+"
        revenue="$100M+"
        icpScore={45}
        violations={8}
        riskLevel="low-risk"
        status="paused"
      />
    </div>
  );
}
