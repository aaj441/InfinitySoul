#!/bin/bash

# Production Deployment Verification Script
# Runs comprehensive post-deployment tests

set -e

API_URL=${1:-"http://localhost:5000"}
VERBOSE=${2:-"false"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Post-Deployment Verification Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected=$4
  
  echo -n "Testing: $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s "$API_URL$endpoint")
  else
    response=$(curl -s -X POST "$API_URL$endpoint" -H "Content-Type: application/json" -d '{}')
  fi
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    if [ "$VERBOSE" = "true" ]; then
      echo "   Response: $response"
    fi
    ((TESTS_FAILED++))
  fi
}

# API Health Tests
echo -e "${YELLOW}1. API Health Checks${NC}"
test_endpoint "Health check" "GET" "/api/health" "healthy"
test_endpoint "Database connection" "GET" "/api/health" "connected"
echo ""

# Industry Intelligence Tests
echo -e "${YELLOW}2. Industry Intelligence Tests${NC}"
test_endpoint "All verticals count" "GET" "/api/vertical-insights" "count"
test_endpoint "Healthcare vertical" "GET" "/api/vertical-insights/Healthcare" "HIPAA"
test_endpoint "Finance vertical" "GET" "/api/vertical-insights/Finance" "SEC"
test_endpoint "E-commerce vertical" "GET" "/api/vertical-insights/E-commerce" "ADA Title III"
test_endpoint "Education vertical" "GET" "/api/vertical-insights/Education" "Section 508"
test_endpoint "Government vertical" "GET" "/api/vertical-insights/Government" "WCAG 2.1 AA"
test_endpoint "SaaS vertical" "GET" "/api/vertical-insights/SaaS" "Product liability"
test_endpoint "Real Estate vertical" "GET" "/api/vertical-insights/Real Estate" "FHA"
test_endpoint "Manufacturing vertical" "GET" "/api/vertical-insights/Manufacturing" "B2B"
echo ""

# Urgency Scores
echo -e "${YELLOW}3. Industry Urgency Score Validation${NC}"
echo -n "Checking urgency scores... "
healthcare=$(curl -s "$API_URL/api/vertical-insights/Healthcare" | grep -o '"complianceUrgencyScore":[0-9]*' | cut -d: -f2)
government=$(curl -s "$API_URL/api/vertical-insights/Government" | grep -o '"complianceUrgencyScore":[0-9]*' | cut -d: -f2)

if [ "$healthcare" = "95" ] && [ "$government" = "98" ]; then
  echo -e "${GREEN}✅ PASS${NC} (Healthcare=95, Government=98)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (Healthcare=$healthcare, Government=$government)"
  ((TESTS_FAILED++))
fi
echo ""

# USPS Integration Tests
echo -e "${YELLOW}4. USPS Certified Mail Tests${NC}"
test_endpoint "Mail cost estimate" "GET" "/api/physical-mail/estimate/cost" "certified"
echo ""

# Compliance Frameworks
echo -e "${YELLOW}5. Compliance Framework Validation${NC}"
echo -n "Validating frameworks... "
frameworks=$(curl -s "$API_URL/api/vertical-insights" | grep -o '"complianceFrameworks"')
if [ -n "$frameworks" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}"
  ((TESTS_FAILED++))
fi
echo ""

# Performance Tests
echo -e "${YELLOW}6. Performance Tests${NC}"
echo -n "Health endpoint response time... "
start=$(date +%s%N)
curl -s "$API_URL/api/health" > /dev/null
end=$(date +%s%N)
time_ms=$(( (end - start) / 1000000 ))
if [ $time_ms -lt 500 ]; then
  echo -e "${GREEN}✅ PASS${NC} (${time_ms}ms)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (${time_ms}ms, expected <500ms)"
  ((TESTS_FAILED++))
fi

echo -n "Vertical insights response time... "
start=$(date +%s%N)
curl -s "$API_URL/api/vertical-insights/Healthcare" > /dev/null
end=$(date +%s%N)
time_ms=$(( (end - start) / 1000000 ))
if [ $time_ms -lt 500 ]; then
  echo -e "${GREEN}✅ PASS${NC} (${time_ms}ms)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (${time_ms}ms)"
  ((TESTS_FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Results:${NC}"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All tests passed! Deployment verified.${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some tests failed. Check configuration.${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi
