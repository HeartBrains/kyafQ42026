# Live and staging deployment cutover

## Repository ownership

`HeartBrains/kyafQ42026` is the canonical repository for this project. The
former `HeartBrains/khaoyaiart-next` repository is retired for ongoing work and
must not receive source changes or deployment pushes. All future production
changes belong on `kyafQ42026/master`.

This repository is configured to produce two isolated static sites:

| Git branch / WordPress source | Site URL | Indexing |
| --- | --- | --- |
| `master` / `content.khaoyaiart.org` | `https://khaoyaiart.org` | Enabled |
| `staging` / `q42026.content.khaoyaiart.org` | `https://dev.khaoyaiart.org` | Disabled |

No WordPress content is copied or imported by this setup. Each build reads from
its own WordPress API endpoint. Source pushes to `master` build production;
source pushes to `staging` build development. The generated `out/` files are
committed back to the same branch so Hostinger can deploy that branch.

## Before enabling the live cutover

1. Create/push the `staging` branch from the current pre-cutover `master`
   snapshot, then trigger its first staging build. Do this before a production
   build commits production output to `master`.
2. Confirm Hostinger's dev project pulls `staging` and serves
   `https://dev.khaoyaiart.org`; configure the live project to pull `master`
   and serve `https://khaoyaiart.org`.
3. Keep the existing staging WordPress deploy-trigger installation set to
   **Staging**. On the live WordPress site, install the updated
   `wp-plugin/bkkk-deploy-trigger/bkkk-deploy-trigger.php` and set Deploy
   Environment to **Production**. The safe default for existing plugin
   installations is Staging.
4. Keep repository secret `GH_PAT` configured with contents read/write access;
   it is used to commit generated output and notify Hostinger through its Git
   integration.
5. If the live WordPress REST API requires application credentials, configure
   `LIVE_WP_AUTH_USER` and `LIVE_WP_AUTH_PASS`. Staging continues to use
   `WP_AUTH_USER` and `WP_AUTH_PASS`. Do not reuse staging credentials as live
   credentials. If the public REST API needs no authentication, the live auth
   secrets can remain unset.
6. Run a production build and inspect the generated canonical URLs, robots
   metadata, and content before changing DNS or redirect behavior. Confirm the
   staging build still points only to the staging WordPress and dev host.

The GitHub workflow rejects WordPress dispatches without a valid environment
instead of guessing. The WordPress plugin attaches the selected environment to
each content-triggered dispatch. Do not set the live CMS plugin to Production
until the live Hostinger project and production build settings have been
verified.

## Normal workflow after cutover

- Push application changes to `master` to rebuild and deploy
  `khaoyaiart.org`.
- Push application changes to `staging` to rebuild and deploy
  `dev.khaoyaiart.org`.
- Publishing content in each WordPress site triggers a build for only its
  selected environment.
- Do not commit a staging `out/` tree to `master` or a production `out/` tree
  to `staging`.
