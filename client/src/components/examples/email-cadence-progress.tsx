import { EmailCadenceProgress } from "../email-cadence-progress";

export default function EmailCadenceProgressExample() {
  const steps = [
    { step: 1, title: "Initial Outreach", status: "completed" as const, date: "Dec 1, 2024" },
    { step: 2, title: "Value Proposition", status: "completed" as const, date: "Dec 3, 2024" },
    { step: 3, title: "Case Study Share", status: "completed" as const, date: "Dec 6, 2024" },
    { step: 4, title: "Video Audit", status: "current" as const, date: "Scheduled: Dec 10, 2024" },
    { step: 5, title: "ROI Calculator", status: "pending" as const },
    { step: 6, title: "Social Proof", status: "pending" as const },
    { step: 7, title: "Urgency + Scarcity", status: "pending" as const },
    { step: 8, title: "Final Follow-up", status: "pending" as const },
  ];

  return (
    <div className="p-4 max-w-md">
      <EmailCadenceProgress steps={steps} />
    </div>
  );
}
