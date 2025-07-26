# fetchLater() SSRF Lab

This lab demonstrates a self xss CSRF chain chain can be abused with Chrome's `fetchLater()` API to turn it into a post-login SSRF vector.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `https://localhost:8444/exploit.html`
2. Click on `Start Exploit`
3. The exploit Flow is explained
4. The scheduled requests that are triggered after the victim is logged in will be made using the valid victim' session.
