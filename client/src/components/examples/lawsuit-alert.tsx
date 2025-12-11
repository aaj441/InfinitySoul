import { LawsuitAlert } from "../lawsuit-alert";

export default function LawsuitAlertExample() {
  return (
    <div className="space-y-4 p-4">
      <LawsuitAlert
        company="BigRetail Corp"
        industry="E-commerce"
        court="S.D.N.Y."
        date="Dec 15, 2024"
        similarity={87}
      />
      <LawsuitAlert
        company="HealthTech Solutions"
        industry="Healthcare"
        court="C.D. Cal."
        date="Dec 18, 2024"
        similarity={72}
      />
    </div>
  );
}
