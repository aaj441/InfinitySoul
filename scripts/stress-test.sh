#!/bin/bash
# InfinitySoul Stress Test - 25 Industry Scan Blast
# Usage: ./scripts/stress-test.sh <API_BASE_URL>

set -e

API_BASE="${1:-http://localhost:8000}"
OUTPUT_DIR="./test-results-$(date +%Y%m%d-%H%M%S)"

echo "🚀 InfinitySoul Stress Test"
echo "=========================================="
echo "API Base: $API_BASE"
echo "Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# Health check first
echo "🏥 Health Check..."
curl -s "$API_BASE/health" | tee "$OUTPUT_DIR/health.json"
echo ""

# Industry targets
declare -A targets=(
  [ecommerce]="https://example.com"
  [saas]="https://vercel.com"
  [healthcare]="https://www.mayoclinic.org"
  [financial]="https://www.chase.com"
  [education]="https://www.harvard.edu"
  [hospitality]="https://www.marriott.com"
  [travel]="https://www.delta.com"
  [media]="https://www.cnn.com"
  [gov]="https://www.usa.gov"
  [nonprofit]="https://www.redcross.org"
  [retail]="https://www.walmart.com"
  [automotive]="https://www.ford.com"
  [realestate]="https://www.zillow.com"
  [legal]="https://www.law.com"
  [insurance]="https://www.geico.com"
  [construction]="https://www.bechtel.com"
  [logistics]="https://www.fedex.com"
  [energy]="https://www.shell.com"
  [manufacturing]="https://www.siemens.com"
  [telecom]="https://www.verizon.com"
  [gaming]="https://www.ea.com"
  [foodbeverage]="https://www.mcdonalds.com"
  [beauty]="https://www.sephora.com"
  [fitness]="https://www.planetfitness.com"
  [consulting]="https://www.mckinsey.com"
)

declare -A job_ids

# Submit all scans
echo "📤 Submitting scans..."
for industry in "${!targets[@]}"; do
  url="${targets[$industry]}"
  echo "  [$industry] $url"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/scan" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$url\"}")
  
  echo "$response" | tee "$OUTPUT_DIR/${industry}_submit.json"
  
  # Extract jobId
  job_id=$(echo "$response" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
  job_ids[$industry]=$job_id
  
  echo "    → Job ID: $job_id"
  sleep 0.5
done

echo ""
echo "✅ Submitted ${#job_ids[@]} scans"
echo ""

# Poll results
echo "⏳ Polling results (60s max)..."
end_time=$(($(date +%s) + 60))

while [ $(date +%s) -lt $end_time ]; do
  completed=0
  
  for industry in "${!job_ids[@]}"; do
    job_id="${job_ids[$industry]}"
    [ -z "$job_id" ] && continue
    
    # Check if already completed
    [ -f "$OUTPUT_DIR/${industry}_result.json" ] && ((completed++)) && continue
    
    # Poll status
    status_response=$(curl -s "$API_BASE/api/v1/scan/$job_id/status")
    status=$(echo "$status_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
      echo "$status_response" > "$OUTPUT_DIR/${industry}_result.json"
      echo "  ✓ [$industry] $status"
      ((completed++))
    fi
  done
  
  echo "  Progress: $completed/${#job_ids[@]}"
  
  [ $completed -eq ${#job_ids[@]} ] && break
  
  sleep 3
done

echo ""
echo "=========================================="
echo "📊 Test Complete"
echo "Results: $OUTPUT_DIR"
echo ""

# Summary
echo "Summary:"
completed_count=$(ls -1 "$OUTPUT_DIR"/*_result.json 2>/dev/null | wc -l)
echo "  Completed: $completed_count / ${#job_ids[@]}"
echo ""

# Show sample results
if [ $completed_count -gt 0 ]; then
  echo "Sample Results:"
  for result in "$OUTPUT_DIR"/*_result.json; do
    [ -f "$result" ] || continue
    industry=$(basename "$result" _result.json)
    violations=$(grep -o '"total":[0-9]*' "$result" | head -1 | cut -d':' -f2)
    risk=$(grep -o '"riskScore":[0-9.]*' "$result" | head -1 | cut -d':' -f2)
    echo "  [$industry] Violations: ${violations:-N/A}, Risk: ${risk:-N/A}"
  done
fi

echo ""
echo "View detailed results:"
echo "  cat $OUTPUT_DIR/*.json | jq ."
