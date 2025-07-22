# Self-XSS + credentialless iframe Exploit Lab

This lab demonstrates a self xss that can be abused with credentialless iframes.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `http://localhost:8081/exploit.html`
2. An alert will pop up with a cookie that is only set on the victim' session. `lol_how=you_accessed_me`
