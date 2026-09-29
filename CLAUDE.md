@AGENTS.md

## Deploy & Hosting

**Stack:** Next.js App Router, `output: "export"` (fully static) · staging WordPress headless CMS (`q42026.content.khaoyaiart.org/wp-json/wp/v2`) · Hostinger static hosting

**Deployment target:** The staging project is `HeartBrains/kyafQ42026`, branch `master` (`https://github.com/HeartBrains/kyafQ42026.git`). Some workspaces have `origin` set to `HeartBrains/khaoyaiart-next`; do not assume `origin` is the staging destination. See `AGENTS.md` for the safe fetch, fast-forward, push, and verification steps.

**How it works:** Hostinger serves pre-built files from the `out/` directory committed to staging `master`. GitHub Actions (`.github/workflows/deploy.yml`) triggers on pushes to `master` that touch `app/**`, `components/**`, `lib/**`, `utils/**`, `public/**`, `next.config.ts`, or `package.json`. The CI flow is: `npm ci` → `npm run build` with Node 20 and staging WordPress settings → commit `out/` back to `master` → Hostinger updates `https://dev.khaoyaiart.org`.

### Normal deploy

Push source changes to `HeartBrains/kyafQ42026/master` using the workflow in `AGENTS.md`. CI builds and commits the new `out/` — no manual output commit is needed when CI succeeds. Keep the duplicate staging deployment isolated from production.

### Local build fallback (when CI is broken)

If CI fails (e.g. expired `GH_PAT` secret), `out/` is never rebuilt and Hostinger serves stale content. Build and push manually:

```bash
# Check CI status
curl -s "https://api.github.com/repos/HeartBrains/kyafQ42026/actions/runs?branch=master&per_page=3" \
  | grep -o '"conclusion":"[^"]*"' | head -3

# Install Node (devcontainer has none by default)
curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir /tmp/fnm --skip-shell
/tmp/fnm/fnm install 20 --fnm-dir /tmp/fnm-versions
export PATH="/tmp/fnm-versions/node-versions/v20.20.2/installation/bin:$PATH"

# Build
cd /workspaces/khaoyaiart-next
npm ci
npm run build

# Verify a changed page, then commit and push only after confirming the output is based on the current staging master
grep -o "ExpectedText" out/kyaf/visit/index.html
git add out/
git commit -m "SSG rebuild $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
TARGET_REPO=https://github.com/HeartBrains/kyafQ42026.git
git push "$TARGET_REPO" HEAD:refs/heads/master
```
