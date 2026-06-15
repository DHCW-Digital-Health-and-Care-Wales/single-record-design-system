# Repository Mirroring — `main` → DHCW org

This repo (`Chuk-DCHW/dhcw-single-record-design-system`) is the working
source of truth. The official DHCW-org repository
(`DHCW-Digital-Health-and-Care-Wales/single-record-design-system`) is kept in
sync automatically.

## How it works

The workflow `.github/workflows/mirror-to-dhcw.yml` runs on every push to
`main` (and can be run manually via **Actions → Mirror main to DHCW → Run
workflow**). It pushes `main` to the DHCW repo over SSH using a **write deploy
key**.

The push is **fast-forward only** — if the DHCW `main` has commits that this
repo doesn't, the mirror fails rather than overwriting them. That is
deliberate: nobody should be committing directly to the DHCW `main`. If it
fails for this reason, reconcile manually (see *Troubleshooting*).

## One-time setup

A deploy key is an SSH key pair that grants access to a **single** repository,
so a leak can't touch anything else.

1. **Generate a key pair dedicated to CI** (keep it separate from any key on
   your laptop so the two can be rotated independently):

   ```bash
   ssh-keygen -t ed25519 -C "dhcw-mirror-ci" -f dhcw-mirror-ci
   ```

   Press Enter twice (no passphrase — CI runs unattended).

2. **Add the public key as a write deploy key on the DHCW repo:**
   DHCW repo → **Settings → Deploy keys → Add deploy key** → paste the
   contents of `dhcw-mirror-ci.pub` → tick **Allow write access** → save.
   (A repo can hold several deploy keys, so this can coexist with the key used
   for manual local pushes.)

3. **Add the private key as a secret on this repo:**
   `Chuk-DCHW/dhcw-single-record-design-system` → **Settings → Secrets and
   variables → Actions → New repository secret** →
   name `DHCW_MIRROR_SSH_KEY`, value = the full contents of the private key
   file `dhcw-mirror-ci` (including the `-----BEGIN/END-----` lines).

4. **Delete the local key files** once they're stored in both places —
   they no longer need to exist on your machine:

   ```bash
   rm dhcw-mirror-ci dhcw-mirror-ci.pub
   ```

5. Push anything to `main` (or run the workflow manually) to confirm it works.

## Security notes

- The deploy key is **scoped to the DHCW repo only**. If the secret leaks, the
  blast radius is that one repository — not your GitHub account.
- Anyone with write access to **this** repo can modify the workflow and
  potentially exfiltrate the secret. Keep that in mind as collaborators are
  added; review changes to `.github/workflows/`.
- Rotate the key if any contributor with access leaves: delete the deploy key
  on the DHCW repo, delete the secret here, and repeat the setup with a new
  pair.

## Manual mirror (fallback)

If the Action is ever disabled, mirror by hand from a local clone:

```bash
git checkout main
git pull origin main
git push org main      # 'org' = your local remote for the DHCW repo
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `DHCW_MIRROR_SSH_KEY secret is not set` | Secret missing | Do step 3 above |
| `Permission denied (publickey)` | Deploy key not added, or not write-enabled | Re-check step 2 ("Allow write access" ticked) |
| `! [rejected] ... (non-fast-forward)` | DHCW `main` has commits this repo lacks | Someone pushed directly to DHCW. Pull those commits into this repo's `main`, reconcile, then let the mirror re-run. Do **not** force-push. |
