Based on slonser's blog post https://blog.slonser.info/posts/make-self-xss-great-again/

# Lab 1 - Credentialless iframe

This lab demonstrates a self xss that can be abused with credentialless iframes.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `http://localhost:8081/exploit.html`
2. An alert will pop up with a cookie that is only set on the victim' session. `lol_how=you_accessed_me`


# Lab 2 - Credentialless iframe + CSRF

This lab demonstrates a self xss CSRF chain chain can be abused with credentialless iframes.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `http://localhost:8081/exploit.html`
2. The exploit Flow is explained
3. The second iframe will show both cookies from the attacker's session and from the victim' session.

# Lab 3 - Cedentialless iframe + CSRF + Captcha example

This lab demonstrates a self xss CSRF chain chain can be abused with credentialless iframes.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `http://localhost:8081/exploit.html`
2. Click on `Start Exploit`
3. The exploit Flow is explained
4. The second iframe will show both cookies from the attacker's session and from the victim' session.


# Lab 4 - Clickjacking

This lab is based on the reverse clickjacking that slonser was suggesting. I didn't feel that the attack scenario was valid or could be considered in a bug bounty context, so I simply ignored it. FYI, it was based on Social Engineering a victim to signup to a product and using the attacker credentials on the target domain while making them believe that they were logging in our fake product page.

# Lab 5 - Self-XSS + CSRF + FRAME DENY + FetchLater()

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


# Lab 6 - Self-XSS + CSRF + FRAME DENY + FetchLater() + redirect loop

This lab demonstrates how delayed redirect chains can be abused with Chrome's `fetchLater()` API to turn it into a post-login SSRF vector.

## Setup

```bash
docker-compose up --build
```

## Usage

1. Visit `https://localhost:8444/exploit.html`
2. Click on `Start Exploit`
3. The exploit Flow is explained
4. The final redirected request will be made to `/fetchlater-log`, now using the valid victim' session.

