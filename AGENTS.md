<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## URL prefix mapping

The BK site uses `/bk/` in URLs but the internal site identifier is `bkkk`. The KYAF site uses `/kyaf/`.

| URL prefix | Internal site ID | Components folder |
|---|---|---|
| `/bk/` | `bkkk` | `components/bkkk/` |
| `/kyaf/` | `kyaf` | `components/kyaf/` |

**`app/not-found.tsx`** maps `/bk/` → `bkkk` in `matchRoute()`. If you add new site prefixes or CPTs, update both `matchRoute()` and `DetailShell` in that file.

## 404s on detail pages

Detail pages are statically built from WP slugs at build time (`generateStaticParams`). Slugs added to WP after the last build will 404 until either:
1. A rebuild runs (CI or local), OR
2. The `not-found.tsx` smart shell handles them at runtime (client-side fetch from WP API)

The smart shell covers: `exhibitions`, `activities`, `moving-image`, `artists`, `blog` for both `/bk/` and `/kyaf/`.

If a detail page 404s:
1. Confirm the slug exists in staging WP: `curl "https://q42026.content.khaoyaiart.org/wp-json/wp/v2/activity?slug=<slug>"`
2. Check `out/<site>/<cpt>/<slug>/` — if missing, the slug wasn't built
3. Check `not-found.tsx` `matchRoute()` handles the URL prefix
4. Run a local build (see `CLAUDE.md` local build fallback) and push `out/`

## Git push and deployment workflow

The staging source repository is `HeartBrains/kyafQ42026`, branch `master` (`https://github.com/HeartBrains/kyafQ42026.git`). Do not assume the checkout's `origin` is this repository: some workspaces configure `origin` as `HeartBrains/khaoyaiart-next`. Never push to that other repository unless the user explicitly changes the destination.

Before pushing:

1. Check `git status --short --branch`, `git remote -v`, and review the exact files to be pushed. Stage only intended source changes; do not include `out/` in a normal source push.
2. Fetch and inspect the current target branch:

   ```sh
   TARGET_REPO=https://github.com/HeartBrains/kyafQ42026.git
   git ls-remote "$TARGET_REPO" refs/heads/master
   git fetch --no-tags "$TARGET_REPO" refs/heads/master:refs/remotes/kyafQ42026/master
   ```

3. Check ancestry before committing/pushing. If fetched `master` is already an ancestor of the current commit, continue. If the current commit is an ancestor of `master` and the target-only changes are generated `out/` files, fast-forward with `git merge --ff-only kyafQ42026/master`, then re-check the worktree and commit the intended source changes. If either side has unique source commits, or the merge is not a clean fast-forward, stop and reconcile/re-test; never force-push or overwrite master.
4. Push explicitly to the correct repository and branch (the `kyafQ42026` remote name may not be configured):

   ```sh
   git push "$TARGET_REPO" HEAD:refs/heads/master
   ```

5. Verify the remote SHA with `git ls-remote "$TARGET_REPO" refs/heads/master`. Check the GitHub Actions run for the pushed commit and confirm the static build/deploy completed before reporting the site updated.

Normal source pushes to `HeartBrains/kyafQ42026/master` trigger `.github/workflows/deploy.yml`. It builds with Node 20, uses the staging WordPress API at `https://q42026.content.khaoyaiart.org`, keeps indexing disabled, commits the generated `out/` back to `master`, and Hostinger serves that output at `https://dev.khaoyaiart.org`. Production repositories, WordPress endpoints, and hosting must remain unchanged unless the user separately approves a production release.

Use the local build fallback in `CLAUDE.md` only after confirming the staging build workflow failed. A missing local Node installation by itself is not a reason to replace the normal CI build path. Do not manually push a stale or unrelated `out/` tree.

## Staging WordPress mailing list

The staging JetEngine CCT is `mailing_list_subscriptions` with `email` and `source_site` fields (`bkkk` or `kyaf`). The custom public submission route is `/wp-json/kyaf/v1/mailing-list`; its source is `wp-plugin/mailing-list-signup/mailing-list-signup.php`.

The static-site GitHub deploy does not install files under `wp-plugin/` into WordPress. Deploy changes to this plugin separately to the staging WordPress plugin directory over authorized Hostinger SSH, run `php -l`, then activate it with WP-CLI if needed. Never put SSH private keys or WordPress credentials in the repository.

The signup form uses a URL-encoded POST (`URLSearchParams`) because the staging host's CORS preflight response does not advertise POST. Keep the handler limited to the two site IDs, validate email server-side, retain its honeypot/rate limit, and do not expose JetEngine's general CCT create endpoint publicly. Verify with a synthetic address and remove only that test row afterward.
