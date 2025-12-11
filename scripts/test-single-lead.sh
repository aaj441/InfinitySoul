#!/bin/bash
# Quick Single Lead Test
# Usage: ./scripts/test-single-lead.sh <URL> [API_BASE]

URL="${1:-https://example.com}"
API_BASE="${2:-http://localhost:8000}"

echo "🔍 Testing Single Lead: $URL"
echo "API: $API_BASE"
echo ""

# Submit scan
echo "📤 Submitting scan..."
response=$(curl -s -X POST "$API_BASE/api/v1/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$URL\"}")

echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Extract job info
job_id=$(echo "$response" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
status_url=$(echo "$response" | grep -o '"statusUrl":"[^"]*"' | cut -d'"' -f4)

if [ -z "$job_id" ]; then
  echo "❌ Failed to get job ID"
  exit 1
fi

echo "Job ID: $job_id"
echo "Status URL: $API_BASE$status_url"
echo ""

# Poll for results
echo "⏳ Waiting for results..."
for i in {1..20}; do
  sleep 2
  
  result=$(curl -s "$API_BASE$status_url")
  status=$(echo "$result" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  
  echo "  [$i] Status: $status"
  
  if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
    echo ""
    echo "📊 Final Result:"
    echo "$result" | python3 -m json.tool 2>/dev/null || echo "$result"
    exit 0
  fi
done

echo ""
echo "⏱️ Timeout - Check status manually:"
echo "  curl $API_BASE$status_url"
