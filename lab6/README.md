# fetchLater() SSRF Lab

This lab demonstrates how delayed redirect chains can be abused with Chrome's `fetchLater()` API to turn it into a post-login SSRF vector.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `https://localhost:8443/exploit.html`
2. Click on `Start Exploit`
3. The exploit Flow is explained
4. The final redirected request will be made to `/fetchlater-log`, now using the valid victim' session.
