# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Valor 2FA seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 **Responsible Disclosure**

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. **DO** email us directly at: `security@valortraders.com`
3. **DO** provide detailed information about the vulnerability
4. **DO** allow us reasonable time to investigate and fix the issue

### 📧 **What to Include in Your Report**

Please include the following information in your security report:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact of the vulnerability
- **Affected Components**: Which parts of the application are affected
- **Suggested Fix**: If you have ideas for how to fix it (optional)

### ⏱️ **Response Timeline**

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Resolution Timeline**: Varies based on complexity, but we aim for quick fixes

### 🏆 **Recognition**

We believe in recognizing security researchers who help make our software safer:

- We'll acknowledge your contribution in our security advisories (unless you prefer to remain anonymous)
- For significant vulnerabilities, we may offer a token of appreciation

### 🚫 **Out of Scope**

The following are generally considered out of scope:

- Issues in third-party dependencies (please report directly to the maintainers)
- Social engineering attacks
- Physical security issues
- Denial of service attacks

### 🛡️ **Security Best Practices**

For users of Valor 2FA:

- Always verify you're using the official version from our repository
- Keep your browser updated for the latest security patches
- Never share your TOTP secrets with anyone
- Use the extension only from official Chrome Web Store (when available)

## Additional Security Information

### 🔐 **Our Security Measures**

- **Client-Side Processing**: All TOTP operations happen locally in your browser
- **No Data Collection**: We don't store or transmit your secrets
- **Open Source**: Full transparency through open source code
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation of all user inputs

### 📚 **Security Resources**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)

---

Thank you for helping keep Valor 2FA secure! 🔐 