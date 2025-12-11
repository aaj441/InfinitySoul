#!/bin/bash
# Example usage of the audit.py tool
# This script demonstrates how to run multiple audits

echo "================================================"
echo "Cyber Security Audit Tool - Example Usage"
echo "================================================"
echo ""

# Check if audit.py exists
if [ ! -f "audit.py" ]; then
    echo "❌ Error: audit.py not found in current directory"
    exit 1
fi

# Check if dependencies are installed
python3 -c "import dns.resolver" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ Installing dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

echo "Example 1: Scan a single domain"
echo "================================"
echo ""
echo "Command: python3 audit.py --domain example.com"
echo ""
read -p "Press Enter to continue..."
echo ""

# Uncomment to actually run (requires network access)
# python3 audit.py --domain example.com

echo "Example 2: Scan your own domain"
echo "================================"
echo ""
read -p "Enter your domain (e.g., mybusiness.com): " DOMAIN

if [ ! -z "$DOMAIN" ]; then
    echo ""
    echo "Running audit for: $DOMAIN"
    echo ""
    python3 audit.py --domain "$DOMAIN"
else
    echo "No domain provided, skipping..."
fi

echo ""
echo "================================================"
echo "For more information, see:"
echo "  - AUDIT_TOOL_README.md"
echo "  - SALES_SCRIPT.md"
echo "================================================"
