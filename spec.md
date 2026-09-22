# Specification: Safe production-like duplicate of the site

## Objective

Create an isolated duplicate of this project so work can continue safely without changing the current live site. The duplicate includes:

- A separate Git repository containing the Next.js application and its deployment workflow.
- A new private GitLab project containing an independent working backup of the duplicate repository.
- A separate production-like hosting target for the static Next.js output.
- A cloned WordPress instance (database, media/uploads, themes/plugins, and configuration) used as the duplicate site's CMS.
- Separate domains/subdomains, credentials, secrets, deployment triggers, and operational ownership so the two systems can be operated independently.

The WordPress clone is an exact private copy as requested. It must remain access-restricted until ownership, DNS, SSL, and integration checks are complete.

The live website is strictly out of scope for mutation. The duplicate setup must be read-only against live systems and must fail closed if any repository, host, DNS, database, credential, or integration target resolves to production.

## Current system context

- Next.js App Router 16 with `output: "export"` and `trailingSlash: true`.
- Static files are generated in `out/` and currently deployed to Hostinger.
- GitHub Actions builds with Node 20 and commits `out/` back to the deployment branch.
- The frontend reads WordPress REST data from `https://content.khaoyaiart.org/wp-json/wp/v2` (or configured `WP_BASE_URL` / `NEXT_PUBLIC_WP_BASE_URL`).
- The application serves both `/bk/` (internal site ID `bkkk`) and `/kyaf/` URL spaces.
- Existing build-time secrets include WordPress URL/authentication and site/base URLs; these must not be copied into source control.

## Requirements

### Repository and source control

1. Create a new private repository from the current repository state, preserving history unless the owner explicitly chooses a fresh-history copy.
2. Use a distinct default branch and repository name; do not point the duplicate's automation at the original repository.
3. Copy source, public assets, configuration, workflow files, and the checked-in `out/` convention required by the current Hostinger deployment. Do not copy credentials, local `.env` files, or unrelated runtime state.
4. Update repository references, badges, deployment comments, and documentation so the duplicate is self-contained and clearly labeled as the duplicate environment.
5. Keep the original repository and its production branch untouched during the duplication.

### WordPress clone

1. Clone the WordPress database and all required filesystem content, including uploads, active theme, plugins, custom code, and multisite configuration if present.
2. Preserve post types, taxonomies, media references, permalinks, users/roles, and site configuration so the duplicate exposes the same REST API shape and content.
3. Replace the clone's canonical URL/home URL and hard-coded production URLs with the duplicate WordPress URL, using a reversible search/replace procedure that does not corrupt serialized values.
4. Configure the duplicate REST endpoint and credentials for the duplicate frontend only.
5. Keep the copy private behind host-level access control (or equivalent) while migration and verification are in progress.
6. Because this is an exact private copy, preserve integrations only after confirming they are intentionally shared or have duplicate-safe credentials/endpoints. Record any integration that must remain pointed at production and obtain explicit approval before enabling it.

### GitLab backup copy

1. Create a new private GitLab project for the duplicate repository backup.
2. Copy the duplicate repository's source and history into GitLab as an independent working copy; this is not a two-way mirror and must not be used by deployment automation.
3. Keep GitLab project visibility private and grant access only to approved maintainers.
4. Define a repeatable manual backup procedure (for example, push the selected duplicate branch/tags to GitLab) and record the last successful backup commit and timestamp.
5. Define a restore procedure that can clone the GitLab project into a fresh repository and verify that the source, history, workflows, and configuration are usable.
6. Do not copy CI secrets, host credentials, `.env` files, database dumps, or WordPress uploads into the GitLab repository. Store WordPress backups in approved encrypted backup storage instead.

### Hosting and deployment isolation

1. Provision a separate production-like host/site for the exported Next.js files, with its own document root, SSH/deployment credentials, domain or subdomain, SSL certificate, and backups.
2. Create a separate CI/CD workflow or repository secrets set for the duplicate. It must build from the duplicate repository and publish only to the duplicate host.
3. Configure duplicate values for `WP_BASE_URL`, `NEXT_PUBLIC_WP_BASE_URL`, `WP_AUTH_USER`, `WP_AUTH_PASS`, `BKKK_BASE_URL`, `KYAF_BASE_URL`, and `SITE_URL` through secret/configuration management.
4. Ensure cache/CDN, robots, sitemap, analytics, webhooks, cron jobs, and deploy triggers are distinguishable from production and cannot overwrite production artifacts.
5. Do not change production DNS or deployment credentials as part of the duplication. DNS cutover, if later requested, is a separate change with rollback instructions.
6. Add a deployment preflight that prints and validates the repository, branch, destination host, document root, WordPress base URL, and site URLs; abort if any value matches a live production target.
7. Use separate deploy keys/tokens with no permission to the live repository, live host, live database, or live WordPress administration.
8. Keep the duplicate on a distinct hostname and document root; do not use production DNS records, redirects, shared writable directories, or shared deployment artifacts.

### Verification and rollback

1. Capture pre-copy identifiers and backups for the source repository, WordPress database/files, and current production deployment configuration.
2. Verify that the duplicate builds from a clean checkout and that generated pages consume the duplicate WordPress API.
3. Verify both site URL spaces (`/bk/` and `/kyaf/`), representative list/detail pages, images, language behavior, sitemap, robots file, and the smart 404 behavior.
4. Verify that the original site still serves its original content and that no duplicate build can publish to it.
5. Document a rollback by disabling the duplicate deployment, restoring the duplicate host/database from backup, and deleting only duplicate DNS/secrets/resources.

## Constraints

- No implementation or production mutation is part of this specification phase.
- The duplicate must be isolated before any code or content fixes are tested.
- The WordPress copy is private and exact; do not anonymize or selectively omit content unless a later approved change supersedes this requirement.
- Credentials and tokens must remain in secret storage; never commit them to Git or place them in `public/` or `out/`.
- WordPress URL replacement must be serialization-safe and preserve attachment paths and REST responses.
- Existing URL mappings remain authoritative: `/bk/` maps to `bkkk`, and `/kyaf/` maps to `kyaf`.
- The static-export limitation remains: new WordPress slugs require a rebuild unless handled by the runtime smart 404 shell.
- Any outbound email, payment, webhook, analytics, or third-party write operation must be explicitly reviewed before enabling it on the clone.
- The duplicate must be independently recoverable without relying on production resources or credentials.
- The GitLab project is an independent backup/working copy only; no automatic two-way synchronization or deployment from GitLab is required.
- No duplicate build, deploy, migration, URL replacement, cron job, webhook, or integration may write to the live website or its WordPress instance.
- Live credentials are never copied, reused, mounted, or granted to duplicate CI, hosting, WordPress, or GitLab operations.
- The default posture is deny-by-default: duplicate services may read a live source only for the controlled copy operation, then must be disconnected from live endpoints.

## Target architecture

```text
Duplicate Git repository
        |
        | CI build (Node 20, npm ci, npm run build)
        | secrets point only to duplicate services
        v
Duplicate static host  <-- separate domain/subdomain + SSL + document root
        |
        | browser fetches / build-time REST requests
        v
Duplicate WordPress host
        |-- cloned database
        |-- cloned wp-content/uploads
        |-- cloned plugins/themes/custom code
        |-- private REST API + duplicate credentials
        `-- reviewed integrations and scheduled jobs

Independent GitLab backup project (private, manual push/restore path)
        ^
        | selected source/history backup; no deployment relationship
        |
Duplicate Git repository
```

The duplicate frontend remains a static export. The duplicate WordPress instance is the content authority for its build and runtime API calls; it must not share write paths or deployment credentials with production.

## Implementation steps

1. **Inventory and freeze the source**
   - Record the source commit, active branch, deployment workflow, host details, environment variables, WordPress version, plugins/themes, cron jobs, integrations, DNS, and backup status.
   - Confirm the source repository is clean or record intentional uncommitted changes before copying.

2. **Create the repository duplicate**
   - Create the private destination repository and copy history/source from the recorded commit.
   - Change repository-specific names, URLs, workflow triggers, branch protections, and secret names as needed.
   - Confirm the duplicate workflow can never target the original repository or host.

3. **Create the GitLab backup project**
   - Create a new private GitLab project in the approved namespace.
   - Push the selected duplicate branch and tags, then record the backup commit and timestamp.
   - Verify the GitLab copy has no secrets and can be cloned independently.

4. **Clone WordPress**
   - Take verified database and filesystem backups.
   - Provision the separate WordPress host and restore the database/files.
   - Perform serialization-safe URL replacement, set duplicate site URLs, configure HTTPS, and validate REST endpoints and media URLs.
   - Recreate users/roles and integrations according to the exact-copy policy; keep the clone private during this phase.

5. **Connect the duplicate frontend**
   - Configure duplicate CI secrets and site URLs.
   - Update only environment/configuration references required to target the duplicate WordPress and static host.
   - Run a clean dependency install and static build; publish to the duplicate document root.

6. **Validate behavior and isolation**
   - Test representative pages and API responses listed in the success criteria.
   - Inspect generated HTML for duplicate URLs and absence of unintended production URLs.
   - Test deployment permissions, backups, logs, SSL, cache invalidation, robots/sitemap behavior, and rollback.
   - Run the deployment preflight with intentionally incorrect/live-target values and confirm it aborts safely.
   - Confirm production remains unchanged throughout by checking live content, deployment logs, DNS, filesystem timestamps, and WordPress audit logs where available.

7. **Handover and operationalize**
   - Record domains, access owners, secret locations, backup schedules, restore steps, integration decisions, and known differences.
   - Mark the duplicate ready for safe fixes only after explicit isolation sign-off.

## Success criteria

- A separate private repository exists with expected source history and no credentials committed.
- A new private GitLab project contains a verified independent copy of the duplicate repository, including expected history and no secrets.
- A separate production-like static host serves the duplicate frontend over HTTPS.
- The cloned WordPress instance is private, restores successfully from backup, and exposes the same required content types, media, users/roles, and REST API behavior as the source.
- The duplicate frontend builds cleanly with Node 20 and reads exclusively from the duplicate WordPress API.
- `/bk/` and `/kyaf/` routes, representative listing/detail pages, images, language switching, sitemap, robots, and smart 404 fallback work on the duplicate domain.
- CI/deployment credentials and triggers are isolated; a duplicate deployment cannot modify the original repository, host, database, or `out/` artifacts.
- Isolation checks prove that the duplicate cannot deploy to, write to, redirect traffic from, or alter content in the live website.
- Exact-copy integrations are documented and intentionally enabled or disabled; no unreviewed outbound side effects occur.
- Backups and a tested rollback procedure exist for the duplicate, and production health checks show no change after the exercise.
- A GitLab restore drill can recreate a usable working repository without access to the original repository or production credentials.

## Open decisions before implementation

- Destination repository is approved as the private GitHub repository `HeartBrains/kyafQ42026`; confirm the default branch when GitHub creation access is available.
- Duplicate frontend and WordPress domains/subdomains.
- Hosting provider and access method for the duplicate static host and WordPress host.
- Whether the duplicate should be indexed after validation or remain blocked by robots/authentication.
- Which integrations may safely remain active on the exact private copy, and who approves them.
- Retention period and storage location for duplicate database/filesystem backups.
- GitLab namespace/project name and the owner of the manual backup/restore responsibility.
