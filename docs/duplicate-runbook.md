# Duplicate environment runbook

This runbook is for the isolated copy described in [`spec.md`](../spec.md). It is intentionally separate from the live deployment workflow. Do not run a duplicate deployment until all destination values are available and the preflight passes.

## Preflight

Set these values from the duplicate environment's secret store or an untracked local environment file:

```sh
export DUPLICATE_REPO_URL='https://git.example.invalid/duplicate/khaoyaiart-next.git'
export DUPLICATE_HOST='duplicate.example.invalid'
export DUPLICATE_DOCUMENT_ROOT='/srv/duplicate-site'
export DUPLICATE_WP_BASE_URL='https://wp-duplicate.example.invalid'
export DUPLICATE_SITE_URL='https://dev.khaoyaiart.org'
export DUPLICATE_ALLOWED_IDENTIFIERS='dev.khaoyaiart.org,q42026.content.khaoyaiart.org'
```

If production has additional hostnames or repository identifiers, provide them as a comma-separated list:

```sh
export LIVE_TARGET_IDENTIFIERS='additional-live-host.example,other-live-repo'
```

Run the guard before every initial duplicate build/deploy:

```sh
npm run verify:duplicate
```

The guard fails when required values are missing, a target contains a known live identifier, or the document root is broad enough to risk overwriting unrelated files. The approved staging hosts are explicitly allowlisted because they share the `khaoyaiart.org` parent domain. It does not contact or modify any external service.

## Repository and GitLab backup

Create the approved private GitHub repository `HeartBrains/kyafQ42026` first, then create a new private GitLab project. Push the selected duplicate branch and tags manually; do not configure GitLab as a deployment remote or two-way mirror. Record the GitLab project URL, commit SHA, and backup timestamp in the handover record. Verify restore by cloning the GitLab project into a fresh directory and checking that workflows and source history are present.

GitHub repository creation and the initial push require authenticated access to the `HeartBrains` owner. The current environment has no repository-creation SCM tool or GitHub CLI, so do not substitute the live repository, force-push to `origin`, or create a public project. Once access is available, create the private project and push the duplicate from a clean source snapshot.

Never commit environment files, access tokens, WordPress database dumps, uploads, or host credentials to either repository.

## Live-site isolation checks

Before creating or connecting the WordPress clone:

1. Confirm the duplicate uses separate repository credentials, host credentials, WordPress credentials, DNS records, document root, and backup storage.
2. Confirm the duplicate WordPress URL is not the live URL and that its admin/API access is restricted.
3. Confirm deployment automation runs only from the duplicate repository and has no permission to the live repository, host, database, or WordPress admin.
4. Confirm duplicate cron jobs, webhooks, email, payments, analytics writes, and third-party integrations are disabled or explicitly approved.
5. Run `npm run verify:duplicate` with the final destination values and retain its output with the deployment record.
6. Keep the staging frontend blocked from indexing. Its `robots.txt` must contain `Disallow: /` and must not reference production sitemap URLs.

If any check is ambiguous, stop. Do not substitute a live credential or destination to make the build pass.
