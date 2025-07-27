# Self-XSS + CSRF login Chain Exploit Lab

This lab demonstrates a self xss CSRF chain chain can be abused with credentialless iframes.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `http://localhost:8081/exploit.html`
2. The exploit Flow is explained
3. The second iframe will show both cookies from the attacker's session and from the victim' session.
