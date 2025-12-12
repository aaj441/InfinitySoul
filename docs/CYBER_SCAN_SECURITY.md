# Cyber Scan Security Considerations

## Certificate Validation Disabled (Intentional)

### Issue
The scout module (`backend/cyber/scout.ts`) intentionally disables SSL certificate validation by setting `rejectUnauthorized: false` in HTTPS requests.

### Rationale
This is a **necessary design decision** for a security scanner:

1. **Purpose**: The scanner must be able to connect to and analyze sites with certificate problems (expired, self-signed, invalid certificates)
2. **Detection**: Certificate issues are exactly what we want to detect and report to users
3. **Safety**: The scanner only performs READ operations - it never sends sensitive data to scanned sites
4. **Limited Scope**: This setting only applies to outbound scanning connections, not to any other part of the application

### Mitigation
- The scanner uses HEAD requests (no body data)
- Connection timeouts prevent hanging on bad servers
- Error handling gracefully handles connection failures
- The analyst module flags sites with HTTPS issues as high-risk

### Future Enhancements
Consider adding:
- Certificate chain analysis to specifically report on certificate issues
- Certificate expiration date checking
- Certificate issuer validation reporting
- Warning levels for self-signed vs expired vs invalid certificates

## Port Scanning

### Approach
The scanner performs conservative, non-intrusive port scanning:

1. **Limited Scope**: Only common service ports (80, 443, 22, 21, 25, 3389, 3306, 5432, 27017)
2. **Timeout**: 2-second timeout per port
3. **Rate Limited**: Checks ports in small batches (3 at a time)
4. **Non-Intrusive**: Simple TCP connection check, no service probing

### Compliance
This approach follows security scanning best practices:
- No SYN floods or aggressive scanning
- Respects timeouts and rate limits
- Only checks standard service ports
- No exploit attempts or vulnerability probing

## Network Isolation

The scanner should be run in an environment where:
- Outbound connections to arbitrary domains are permitted
- The scanner has no access to sensitive internal resources
- Scanner output (evidence, reports, leads) is properly secured

## Data Privacy

### What We Collect
- Domain names (provided by users)
- IP addresses (from DNS resolution)
- HTTP response codes
- Security headers (public information)
- Open ports (network-level information)

### What We Don't Collect
- Website content
- User data
- Authentication credentials
- Session information
- Personal information

### Data Storage
- All scan results are stored locally
- Output files should be treated as sensitive business information
- No scan data is transmitted to third parties
- JSONL lead log should be secured appropriately

## Recommendations

For production deployment:
1. Run scanner in isolated environment
2. Secure output directories with appropriate file permissions
3. Implement rate limiting on scan requests
4. Add user consent mechanisms before scanning
5. Provide clear terms of service for scanning usage
6. Consider geographical scanning restrictions based on legal requirements
