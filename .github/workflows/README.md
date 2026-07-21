# GitHub Actions Workflows

This directory contains automated workflows for the jurnal_mu project.

## Workflows Overview

### 1. PR Quality Checks (`pr-checks.yml`)
**Triggers:** On every pull request to `main` or `develop` branches

Runs comprehensive quality checks including:
- **PHP Code Style**: Validates PHP code style using Laravel Pint
- **JavaScript/TypeScript Linting**: Checks JS/TS code with ESLint
- **Code Formatting**: Verifies code formatting with Prettier
- **Type Checking**: Ensures TypeScript types are correct
- **Tests**: Runs the full test suite with Pest

All checks must pass before a PR can be merged.

### 2. PR Labeler (`pr-labeler.yml`)
**Triggers:** When a PR is opened, synchronized, or reopened

Automatically labels PRs based on:
- **File Changes**: Labels like `backend`, `frontend`, `documentation`, `dependencies`, `ci/cd`, `configuration`, `tests`
- **PR Size**: Labels like `size/xs`, `size/s`, `size/m`, `size/l`, `size/xl` based on lines changed

### 3. PR Welcome Message (`pr-welcome.yml`)
**Triggers:** When a new PR is opened

Posts a welcoming comment with:
- Greeting to the contributor
- Checklist of requirements
- Information about automated checks
- Guidance on next steps

### 4. PR Auto Assignment (`pr-auto-assign.yml`)
**Triggers:** When a PR is opened or marked ready for review

Analyzes the PR and:
- Comments on documentation-only PRs
- Comments on test-only PRs
- Can be extended to assign specific reviewers based on file paths

### 5. PR Status Update (`pr-status-update.yml`)
**Triggers:** When the "PR Quality Checks" workflow completes

Updates the PR with:
- Success/failure status of quality checks
- Link to the workflow run details
- Timestamp of when checks completed

### 6. Tests (`tests.yml`)
**Triggers:** On push to `main` or `develop`, and on pull requests

Runs the complete CI pipeline:
- Sets up PHP and Node.js
- Installs dependencies
- Builds assets
- Runs tests

## Configuration Files

### `.github/labeler.yml`
Configuration for automatic PR labeling based on file patterns.

## How It Works

When you create a new pull request:

1. **Welcome message** is posted immediately
2. **Labels** are automatically applied based on changed files and PR size
3. **Quality checks** run in parallel:
   - PHP linting
   - JS/TS linting
   - Code formatting checks
   - TypeScript type checking
   - Full test suite
4. **Status update** comment is posted when all checks complete
5. **Auto-assignment** analyzes the PR and may add helpful comments

## Adding Custom Automation

To add more automation:

1. Create a new workflow file in `.github/workflows/`
2. Define the trigger events (e.g., `pull_request`, `issues`, etc.)
3. Add your automation steps
4. Commit and push to see it in action

## Permissions

Most workflows use minimal permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Comment on and label PRs
- `actions: read` - Read workflow run information

## Local Testing

Before pushing changes:

```bash
# Run PHP linting
./vendor/bin/pint --test

# Run JS linting
npm run lint

# Check formatting
npm run format:check

# Check types
npm run types

# Run tests
./vendor/bin/pest
```

## Troubleshooting

If a workflow fails:

1. Check the workflow run details in the GitHub Actions tab
2. Review the error messages in the logs
3. Run the same checks locally to reproduce the issue
4. Fix the issue and push again

## Maintenance

- Keep action versions up to date (check for `@vX` in workflow files)
- Review and update labeler configuration as project structure changes
- Adjust thresholds (e.g., PR size limits) as needed
