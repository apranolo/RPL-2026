# PR Automation Flow Diagram

## When You Create a Pull Request

```
┌─────────────────────────────────────────────────────────────┐
│                     Pull Request Created                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │   Immediate Actions   │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│   Welcome     │   │   Auto       │   │   Quality    │
│   Message     │   │   Label      │   │   Checks     │
│   Posted      │   │   Applied    │   │   Started    │
└───────────────┘   └──────────────┘   └──────┬───────┘
                                               │
                            ┌──────────────────┼──────────────────┐
                            │                  │                  │
                            ▼                  ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                    │  PHP Linting │   │  JS Linting  │   │  Formatting  │
                    │  (Pint)      │   │  (ESLint)    │   │  (Prettier)  │
                    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                           │                  │                  │
                           └──────────────────┼──────────────────┘
                                              │
                            ┌─────────────────┼─────────────────┐
                            │                 │                 │
                            ▼                 ▼                 ▼
                    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                    │  Type Check  │   │  Run Tests   │   │  Auto Assign │
                    │  (TypeScript)│   │  (Pest)      │   │  Analysis    │
                    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                           │                  │                  │
                           └──────────────────┼──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Status Update   │
                                    │  Comment Posted  │
                                    └──────────────────┘
```

## Workflow Files

```
.github/
├── labeler.yml                      # Configuration for auto-labeling
└── workflows/
    ├── pr-auto-assign.yml          # Analyzes PR and adds context
    ├── pr-checks.yml               # Runs all quality checks (parallel)
    ├── pr-labeler.yml              # Applies labels based on files/size
    ├── pr-status-update.yml        # Posts check results
    ├── pr-welcome.yml              # Welcome message for new PRs
    ├── tests.yml                   # Original test workflow (kept)
    └── README.md                   # Workflow documentation
```

## Labels Applied Automatically

### By File Type

- `backend` - PHP/Laravel files changed
- `frontend` - React/TypeScript files changed
- `documentation` - Markdown/docs files changed
- `dependencies` - Package files changed
- `ci/cd` - GitHub Actions files changed
- `configuration` - Config files changed
- `tests` - Test files changed

### By Size

- `size/xs` - ≤10 lines changed
- `size/s` - ≤100 lines changed
- `size/m` - ≤500 lines changed
- `size/l` - ≤1000 lines changed
- `size/xl` - >1000 lines changed

## Quality Checks Run

1. ✅ **PHP Code Style** - Laravel Pint ensures consistent PHP formatting
2. ✅ **JavaScript Linting** - ESLint catches JS/TS issues
3. ✅ **Code Formatting** - Prettier enforces consistent style
4. ✅ **Type Safety** - TypeScript compiler checks types
5. ✅ **Tests** - Pest runs the full test suite

All checks run in parallel for faster feedback!

## Permissions (Security)

All workflows use minimal permissions:

- `contents: read` - Only read access to repository
- `pull-requests: write` - Only for commenting/labeling PRs
- `actions: read` - Only for reading workflow status

## Example PR Timeline

```
00:00 - PR Created
00:01 - Welcome message posted
00:01 - Labels applied (backend, size/m)
00:01 - Quality checks started (5 jobs in parallel)
00:05 - All checks completed
00:05 - Status update comment posted
       ✅ "All quality checks passed!"
```

## Benefits

🚀 **Faster Reviews** - Size labels help prioritize  
🔍 **Better Quality** - Automated checks catch issues early  
📝 **Better Organization** - Auto-labels categorize PRs  
👋 **Better Onboarding** - Welcome messages guide contributors  
🔒 **More Secure** - Explicit permissions limit attack surface

## Customization

All workflows can be customized by editing files in `.github/workflows/`.
See the README in that directory for detailed documentation.
