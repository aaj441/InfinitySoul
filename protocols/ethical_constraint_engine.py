"""
Ethical Constraint Engine - The Rawkus Bar

Every agent must pass the Rawkus Bar before executing any action.
This engine checks for lyrical integrity: ethical soundness, fairness, transparency.

"No corny bars allowed."
"""

from typing import Dict, Tuple, List, Any
from dataclasses import dataclass
from enum import Enum


class EthicsViolation(Enum):
    """Types of ethics violations that trigger the Rawkus Bar."""
    DISCRIMINATION = "discrimination"
    PREDATORY_PRICING = "predatory_pricing"
    DATA_EXPLOITATION = "data_exploitation"
    LACK_OF_TRANSPARENCY = "lack_of_transparency"
    COMMUNITY_BETRAYAL = "community_betrayal"
    UNFAIR_DENIAL = "unfair_denial"


@dataclass
class EthicsCheckResult:
    """Result from an ethics check."""
    passed: bool
    violations: List[EthicsViolation]
    explanation: str
    severity: str  # "low", "medium", "high", "critical"


class CornyBarError(Exception):
    """Raised when an agent spits corny bars (fails ethics check)."""
    pass


class NoHitError(Exception):
    """Raised when an agent's verse doesn't have major label appeal (fails profit check)."""
    pass


class EthicalConstraintEngine:
    """
    The Rawkus Bar: Checks if agent actions have lyrical integrity.
    
    Every action must be:
    1. Non-discriminatory
    2. Not predatory
    3. Transparent
    4. Community-aligned
    5. Data-respectful
    """
    
    def __init__(self):
        self.protected_classes = [
            "race", "ethnicity", "gender", "age", "religion",
            "disability", "national_origin", "sexual_orientation"
        ]
        self.max_margin = 0.20  # 20% max margin over actuarial cost
        self.transparency_required = True
        
    def check(self, bars: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if the bars (action parameters) pass the Rawkus Bar.
        
        Args:
            bars: Dictionary containing action parameters
            
        Returns:
            (passed, explanation) tuple
        """
        result = self._comprehensive_check(bars)
        
        if not result.passed:
            return False, self._format_violation(result)
        
        return True, "Bars passed the Rawkus check"
    
    def _comprehensive_check(self, bars: Dict[str, Any]) -> EthicsCheckResult:
        """Run comprehensive ethics checks."""
        violations = []
        
        # Check 1: No discrimination
        if self._has_discrimination(bars):
            violations.append(EthicsViolation.DISCRIMINATION)
        
        # Check 2: No predatory pricing
        if self._has_predatory_pricing(bars):
            violations.append(EthicsViolation.PREDATORY_PRICING)
        
        # Check 3: No data exploitation
        if self._has_data_exploitation(bars):
            violations.append(EthicsViolation.DATA_EXPLOITATION)
        
        # Check 4: Transparency required
        if not self._has_transparency(bars):
            violations.append(EthicsViolation.LACK_OF_TRANSPARENCY)
        
        # Check 5: Community alignment
        if self._betrays_community(bars):
            violations.append(EthicsViolation.COMMUNITY_BETRAYAL)
        
        if violations:
            severity = self._calculate_severity(violations)
            explanation = self._explain_violations(violations)
            return EthicsCheckResult(
                passed=False,
                violations=violations,
                explanation=explanation,
                severity=severity
            )
        
        return EthicsCheckResult(
            passed=True,
            violations=[],
            explanation="All ethics checks passed",
            severity="none"
        )
    
    def _has_discrimination(self, bars: Dict[str, Any]) -> bool:
        """Check for discriminatory factors in decision making."""
        # Check if any protected class is being used as a decision factor
        decision_factors = bars.get("factors", {})
        
        for protected_class in self.protected_classes:
            if protected_class in decision_factors:
                return True
        
        # Check for proxy discrimination (e.g., zip code as proxy for race)
        if "zip_code" in decision_factors and "income" not in decision_factors:
            # Zip code alone can be a proxy for race - flag this
            return True
        
        return False
    
    def _has_predatory_pricing(self, bars: Dict[str, Any]) -> bool:
        """Check for predatory pricing tactics."""
        pricing = bars.get("pricing", {})
        
        if not pricing:
            return False
        
        base_cost = pricing.get("base_cost", 0)
        quoted_price = pricing.get("quoted_price", 0)
        
        if base_cost == 0:
            return False
        
        margin = (quoted_price - base_cost) / base_cost
        
        # Check if margin exceeds maximum allowed
        if margin > self.max_margin:
            return True
        
        # Check for bait-and-switch tactics
        if pricing.get("introductory_rate") and pricing.get("renewal_rate"):
            intro = pricing["introductory_rate"]
            renewal = pricing["renewal_rate"]
            if renewal > intro * 1.5:  # 50% increase is predatory
                return True
        
        return False
    
    def _has_data_exploitation(self, bars: Dict[str, Any]) -> bool:
        """Check for data exploitation tactics."""
        data_usage = bars.get("data_usage", {})
        
        if not data_usage:
            return False
        
        # Check if selling data without consent
        if data_usage.get("sell_to_third_party") and not data_usage.get("user_consent"):
            return True
        
        # Check for opaque data collection
        if data_usage.get("collect_data") and not data_usage.get("disclosed_to_user"):
            return True
        
        # Check for surveillance capitalism
        if data_usage.get("behavioral_tracking") and not data_usage.get("opt_in_consent"):
            return True
        
        return False
    
    def _has_transparency(self, bars: Dict[str, Any]) -> bool:
        """Check if action has required transparency."""
        if not self.transparency_required:
            return True
        
        # Check if decision has explanation
        if "decision" in bars and "explanation" not in bars:
            return False
        
        # Check if rejection has reason
        if bars.get("action") == "reject" and not bars.get("reason"):
            return False
        
        # Check if pricing has breakdown
        if "pricing" in bars and "breakdown" not in bars.get("pricing", {}):
            return False
        
        return True
    
    def _betrays_community(self, bars: Dict[str, Any]) -> bool:
        """Check if action betrays community trust."""
        governance = bars.get("governance", {})
        
        # Check if action requires vote but doesn't have one
        if bars.get("requires_vote") and not governance.get("vote_passed"):
            return True
        
        # Check if action contradicts community vote
        if governance.get("community_position") == "reject" and bars.get("action") == "approve":
            return True
        
        # Check if selling the claims graph (never allowed)
        if bars.get("action") == "sell_claims_graph":
            return True
        
        return False
    
    def _calculate_severity(self, violations: List[EthicsViolation]) -> str:
        """Calculate severity based on violations."""
        critical_violations = [
            EthicsViolation.DISCRIMINATION,
            EthicsViolation.COMMUNITY_BETRAYAL
        ]
        
        high_violations = [
            EthicsViolation.PREDATORY_PRICING,
            EthicsViolation.DATA_EXPLOITATION
        ]
        
        if any(v in critical_violations for v in violations):
            return "critical"
        elif any(v in high_violations for v in violations):
            return "high"
        elif len(violations) > 2:
            return "high"
        elif len(violations) > 1:
            return "medium"
        else:
            return "low"
    
    def _explain_violations(self, violations: List[EthicsViolation]) -> str:
        """Generate human-readable explanation of violations."""
        explanations = {
            EthicsViolation.DISCRIMINATION: "Discriminatory factors detected in decision making",
            EthicsViolation.PREDATORY_PRICING: "Pricing exceeds fair margin or uses predatory tactics",
            EthicsViolation.DATA_EXPLOITATION: "Data usage violates user consent or privacy",
            EthicsViolation.LACK_OF_TRANSPARENCY: "Decision lacks required transparency or explanation",
            EthicsViolation.COMMUNITY_BETRAYAL: "Action contradicts community governance or trust",
            EthicsViolation.UNFAIR_DENIAL: "Denial lacks justification or appears unfair"
        }
        
        return "; ".join([explanations[v] for v in violations])
    
    def _format_violation(self, result: EthicsCheckResult) -> str:
        """Format violation message for logging."""
        return f"[{result.severity.upper()}] {result.explanation} (Violations: {[v.value for v in result.violations]})"


class ProfitOracle:
    """
    Checks if agent actions have "major label appeal" (>10x ROI).
    
    The Rawkus model requires both lyrical integrity AND commercial viability.
    """
    
    def __init__(self):
        self.min_roi_multiple = 10.0
    
    def check(self, bars: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if the bars (action) have major label appeal.
        
        Args:
            bars: Dictionary containing action parameters
            
        Returns:
            (passed, explanation) tuple
        """
        roi_projection = bars.get("roi_projection", {})
        
        if not roi_projection:
            # If no ROI projection provided, assume it's not a financial decision
            return True, "No ROI assessment required"
        
        expected_roi = roi_projection.get("expected_multiple", 0)
        
        if expected_roi < self.min_roi_multiple:
            return False, f"Expected ROI {expected_roi}x is below minimum {self.min_roi_multiple}x"
        
        return True, f"ROI projection {expected_roi}x meets requirements"


class ValueLedger:
    """
    Tracks who gets paid (royalty tracker).
    
    Ensures transparent value attribution across the RAWKUS ecosystem.
    """
    
    def __init__(self):
        self.ledger = []
    
    def record_value(self, source: str, recipient: str, amount: float, reason: str):
        """Record a value transfer."""
        entry = {
            "source": source,
            "recipient": recipient,
            "amount": amount,
            "reason": reason,
            "timestamp": self._get_timestamp()
        }
        self.ledger.append(entry)
    
    def get_balance(self, recipient: str) -> float:
        """Get total value attributed to a recipient."""
        return sum(
            entry["amount"]
            for entry in self.ledger
            if entry["recipient"] == recipient
        )
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Example usage
if __name__ == "__main__":
    engine = EthicalConstraintEngine()
    
    # Example 1: Clean bars (should pass)
    clean_bars = {
        "action": "underwrite",
        "factors": {
            "revenue": 1000000,
            "employee_count": 50,
            "security_posture": "good"
        },
        "pricing": {
            "base_cost": 10000,
            "quoted_price": 11000,
            "breakdown": {
                "base": 10000,
                "margin": 1000
            }
        },
        "explanation": "Risk assessed based on security posture and company size"
    }
    
    passed, msg = engine.check(clean_bars)
    print(f"Clean bars: {passed} - {msg}")
    
    # Example 2: Corny bars (should fail - discrimination)
    corny_bars = {
        "action": "underwrite",
        "factors": {
            "zip_code": "10001",  # Proxy discrimination
            "revenue": 1000000
        },
        "pricing": {
            "base_cost": 10000,
            "quoted_price": 15000  # 50% margin (predatory)
        }
    }
    
    passed, msg = engine.check(corny_bars)
    print(f"Corny bars: {passed} - {msg}")
