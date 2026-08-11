# When `npm install` fails on a corporate machine

Written after a developer could not install dependencies for a **blank React
app** on a DHCW machine.

---

## First, the important part: this is not the design system

A blank React app has none of our code in it, so a failure there is an
environment problem, not a Single Record one. Worth knowing regardless, because
the same environment has to work before anyone can install our packages.

It is also worth knowing how little we add to the problem:

| Package | Third-party runtime dependencies |
|---|---|
| `@dhcw/sr-tokens` | **none** |
| `@dhcw/sr-icons` | **none** |
| `@dhcw/sr-web` | **none** (only our own two above) |
| `@dhcw/sr-react` | **none** — `react` and `react-dom` are *peer* dependencies, i.e. the app's own copy |

So the design system pulls nothing extra off the network. Whatever is failing
for a blank app is what will fail for ours, no more.

---

## You are not blocked while this is sorted out

The web package ships built files that need **no npm, no build step and no
network at all**. Two files is the whole install:

```
packages/web/dist/single-record.css
packages/web/dist/sprite.svg
```

```html
<link rel="stylesheet" href="single-record.css">

<h1 class="sr-type-heading-l">Patient record</h1>
<button class="sr-button sr-button--primary">Save</button>
```

Roboto is **embedded in the CSS as a data URI**, so there is no Google Fonts
request and nothing to be blocked by a firewall. Verified: a page built from
those two files alone renders the type scale, both button variants and a sprite
icon with no network access.

**One gotcha.** Opening the file directly with `file://` works for everything
*except* the sprite icons — a cross-file `<use>` is blocked there and fails
silently, so icons come out blank. Either serve the folder over HTTP (VS Code's
Live Server extension, or `python -m http.server`), or use `icons.js` instead of
the sprite.

The site's **Get the files** page covers all of this, and
`npm install github:...` is the other supported route.

---

## Diagnosing it properly

The message *"couldn't install some of the dependencies"* is not enough to act
on — every cause below produces a different error. Ask for this, run from the
folder that failed:

```powershell
node -v
npm -v
npm config get registry
npm config get proxy
npm config get https-proxy
npm config get cafile
npm ping
```

and then the real failure:

```powershell
npm install --loglevel verbose  2>&1 | Tee-Object -FilePath npm-debug-output.txt
```

The last 40 lines of that file, plus the seven values above, identify which of
the following it is in about a minute.

---

## The four likely causes

### 1. Corporate TLS interception — the most common in NHS organisations

The proxy (Zscaler, Netskope, Forcepoint and similar) re-signs HTTPS traffic
with its own certificate. Node does not trust it, so npm refuses the connection.

**Errors:** `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, `SELF_SIGNED_CERT_IN_CHAIN`,
`unable to get local issuer certificate`.

**Fix:** point npm at the organisation's CA bundle, which IT can supply:

```powershell
npm config set cafile "C:\path\to\dhcw-root-ca.pem"
```

> **Do not use `npm config set strict-ssl false`.** It appears to fix it because
> it turns certificate verification off entirely, which means npm will accept
> any package from anyone. On a clinical estate that is not a workaround, it is
> a supply-chain hole.

### 2. Proxy not configured for npm

The browser is configured, npm is not, so npm tries to reach the registry
directly and is dropped.

**Errors:** `ETIMEDOUT`, `ECONNREFUSED`, `ENOTFOUND registry.npmjs.org`, or a
hang with no output.

**Fix:**

```powershell
npm config set proxy http://proxy.example.nhs.uk:8080
npm config set https-proxy http://proxy.example.nhs.uk:8080
```

### 3. A stray `.npmrc` pointing at a private feed

A leftover Azure Artifacts registry with no credentials fails on every package,
including ones that are on the public registry.

**Errors:** `E401`, `401 Unauthorized`, `ENEEDAUTH`.

**Check:** `npm config get registry` should be
`https://registry.npmjs.org/`. Look for `.npmrc` in the project folder and in
`C:\Users\<you>\.npmrc`.

### 4. Visual Studio's bundled Node, not the one you installed

**This is the one to check first if the developer is working in Visual Studio**,
and it fits the report closely.

VS ships its own Node and npm and, by default, **prefers them over whatever is
on your PATH** — so `node -v` in a terminal can report a current version while
VS quietly builds with a much older one.

**Errors:** `Unsupported engine`, `Unexpected token`, a lockfile-version
complaint, or packages that install fine from a terminal and fail inside VS.

**Fix:** install Node LTS from [nodejs.org](https://nodejs.org/), then in Visual
Studio:

**Tools → Options → Projects and Solutions → Web Package Management → External
Web Tools**

Move `$(PATH)` **above** the entry pointing inside the Visual Studio install
directory, then restart VS.

That also answers "will VS 2026 fix it": only incidentally, by bundling a newer
Node. The ordering problem is a setting, and it is worth correcting either way.

### Also worth a try: peer dependency conflicts

npm 7 and later refuse to install on a peer-dependency conflict where npm 6
would have carried on.

**Error:** `ERESOLVE unable to resolve dependency tree`.

**Diagnostic:** `npm install --legacy-peer-deps`. If that succeeds, the problem
is a version conflict in the app's own dependencies, not the network.

---

## Trying it yourself, without Visual Studio

You do not need VS, and you do not need to be able to install anything.

1. Download `single-record.css` and `sprite.svg` from the **Get the files** page.
2. Put them in a folder with an `index.html` like the one at the top of this page.
3. Open the folder in VS Code and start **Live Server**, or run
   `python -m http.server` in it, then visit `http://localhost:8000`.

If the buttons are navy and the text is Roboto, the design system is working and
the problem is entirely in the npm toolchain. That is a useful thing to be able
to say with certainty.

---

## What this means for distribution

DDR-020 chose public npm partly because *"every alternative puts a credential
between a developer and their first install"*. This report is that risk showing
up one layer down: the registry choice is right, and the corporate network is
still in the way.

Two things follow:

- The **built-files route matters more than it looks**. It is the path that
  works when the toolchain does not, and it should stay a first-class option
  rather than a fallback mentioned in passing.
- **Publishing will not fix this.** A developer who cannot reach
  `registry.npmjs.org` today will not be able to reach our package there either.
  Sorting the proxy and CA configuration is a prerequisite, not a follow-up.
