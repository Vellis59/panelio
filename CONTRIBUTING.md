# Contributing to Panelio

Thanks for your interest in improving Panelio.

Panelio is a fork of [Homepage](https://github.com/gethomepage/homepage) with a stronger focus on a built-in admin experience. Contributions are welcome, especially when they keep the project simpler, clearer, and easier to maintain.

## Before You Start

A few principles help keep contributions useful:

- prefer small, focused pull requests
- keep the user experience simple
- avoid unnecessary complexity
- preserve compatibility with the existing file-based configuration model when possible
- explain the real-world benefit of the change

If you are planning a larger feature, open an issue or start a discussion first so the direction can be confirmed before a lot of work is done.

## Good First Contributions

Helpful contributions include:

- bug fixes
- README and documentation improvements
- tests for admin panel behavior
- tests for config file CRUD logic
- UI polish that improves clarity without adding product complexity
- small performance or maintainability improvements

## Development Setup

```bash
git clone https://github.com/Vellis59/panelio.git
cd panelio
pnpm install
cp -r deploy/config ./config
HOMEPAGE_ALLOWED_HOSTS=localhost PANELIO_ADMIN_PASSWORD=changeme pnpm dev
```

Useful commands:

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:coverage
pnpm lint
```

## Pull Request Guidelines

Please try to keep pull requests easy to review.

### Before opening a PR

- make sure the change solves one clear problem
- run the relevant checks locally
- update docs if behavior changed
- add or update tests when practical
- keep unrelated changes out of the same PR

### In the PR description

Please include:

- **what changed**
- **why it matters**
- **how to test it**
- screenshots for UI changes, if relevant

A short PR with a clear explanation is better than a large PR with mixed goals.

## Reporting Bugs

When reporting a bug, please include:

- what you were trying to do
- what happened instead
- how to reproduce the issue
- your deployment method (local, Docker, EasyPanel, Coolify, etc.)
- relevant logs or screenshots if available

## Tests

Tests do not need to be perfect to be useful.

For now, the most valuable tests are:

- admin panel behavior
- config read/write logic
- basic regression coverage for core CRUD flows

Simple, focused tests are preferred over large or brittle suites.

## Upstream Relationship

Panelio builds on top of Homepage, and upstream improvements still matter.

- If a change clearly belongs in Homepage itself, consider contributing upstream too.
- If a change is specific to Panelio's admin-focused direction, it likely belongs here.

Homepage upstream repository:
- https://github.com/gethomepage/homepage

## Code Style

Please follow the existing project style and avoid introducing new patterns unless there is a clear reason.

When in doubt:

- choose readability over cleverness
- choose maintainability over abstraction
- choose smaller changes over sweeping rewrites

## License

By contributing, you agree that your contributions will be distributed under the same license used by this repository.

See [LICENSE](./LICENSE) for the current license text.

## Questions

If you are unsure whether something is a good fit, open a discussion first. That is often the fastest way to avoid wasted effort.

Thanks again for helping make Panelio better.
