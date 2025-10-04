# Insecure Code

The code provided contains several security vulnerabilities that could be exploited by malicious actors.

| ID      | Where                      | What                                                | OWASP                              |
|---------|----------------------------|-----------------------------------------------------|------------------------------------|
| VULN-1  | `src/state.js`             | Hard-coded secret                                   | **A02: Cryptographic Failures**    |
| VULN-2  | `src/utils.js/send`        | `Access-Control-Allow-Origin: *` (wildcard CORS)    | **A05: Security Misconfiguration** |
| VULN-3  | `src/utils.js/makeToken`   | Predictable, unsigned token (base64 of id\:ts\:key) | **A02: Cryptographic Failures**    |
| VULN-4  | `src/utils.js/tokenId`     | No expiry/revocation; auth trusts shared key        | **A01: Broken Access Control**     |
| VULN-5  | `src/handlers/auth.js`     | MD5 password hashing (weak, unsalted)               | **A02: Cryptographic Failures**    |
| VULN-6  | `src/handlers/admin.js`    | Exposes internal state to any caller                | **A01: Broken Access Control**     |
| VULN-7  | `src/handlers/diagnose.js` | `exec('ping -c 1 ' + ip)` command injection         | **A03: Injection**                 |
| VULN-8  | `src/handlers/energy.js`   | Dispatch lets unauth/forged callers act as others   | **A01: Broken Access Control**     |
| VULN-9  | `src/handlers/compute.js`  | `eval(expr)` → RCE                                  | **A03: Injection**                 |
| VULN-10 | `src/handlers/status.js`   | Leaks `process.env`                                 | **A05: Security Misconfiguration** |
| VULN-11 | `src/handlers/status.js`   | Returns stack traces to clients                     | **A05: Security Misconfiguration** |
| VULN-12 | `src/handlers/welcome.js`  | Directly interpolating into template string         | **A03: Injection**                 |
