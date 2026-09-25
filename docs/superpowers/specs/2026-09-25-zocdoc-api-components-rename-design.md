# Zocdoc API Components Package and Repository Rename

**Date:** 2026-09-25
**Status:** Approved design, ready for implementation planning

## Purpose

Rename this unused monorepo and its package identities so the repository and public-facing
package names consistently describe the Zocdoc API Components project. No compatibility
migration is required because the packages are not currently used by external consumers.

## Scope

The coordinated rename changes these identities:

| Current identity | New identity |
|---|---|
| `powered-by-zocdoc` repository/local directory | `zocdoc-api-components` |
| `@powered-by-zocdoc/api-components` | `@zocdoc/api-components` |
| `@powered-by-zocdoc/primitives` | `@zocdoc/api-primitive-components` |

The private workspace root will use `zocdoc-api-components` as its package name. It remains a
private workspace coordinator and is not made publishable by this change.

The GitHub repository will be renamed to `zocdoc-api-components`, the local directory will be
renamed to match, and the `origin` remote and absolute repository/Pages links will be updated.

## Design

### Package graph and metadata

Update the package `name` fields, workspace dependency keys, package-filter commands, CEM
package arguments, and any package README metadata. Preserve the dependency direction:

```text
@zocdoc/api-primitive-components ← @zocdoc/api-components ← demo
```

The demo and docs packages continue to consume the two workspace packages. The package
exports and runtime APIs remain unchanged apart from package import specifiers.

### Source and tooling references

Replace the old scoped package names in all live source, test, fixture, build, and tooling
references. This includes API component imports from the primitive package, demo/docs imports
from the API component package, Vite package resolution, CEM scripts, CEM agent-doc tests and
snapshots, and package-filter commands.

Update live developer guidance in `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, package
READMEs, `.agents/rules/`, `.claude/rules/`, and `.claude/skills/` so examples and generated
reference metadata use the new names. Historical superpowers plans and specifications remain
point-in-time records and are not rewritten.

Generated `custom-elements.json` manifests and `packages/*/dist/` output are not edited
manually. Regenerate supported generated artifacts through the existing CEM/build commands.

### Repository identity

After the tracked-file rename is complete and verified, rename the GitHub repository through
the repository hosting workflow, update `origin` to the renamed URL, and rename the local
working directory to `zocdoc-api-components`. Verify the remote URL, current path, and any
GitHub Pages URL documented in the repository.

## Implementation sequence

1. Work on the dedicated rename branch created from `main`.
2. Update root and package metadata, workspace dependency names, source imports, configuration,
   tests, and live documentation.
3. Regenerate the lockfile and generated CEM/agent documentation using the repository tooling.
4. Search tracked files while excluding generated manifests, build output, and historical
   superpowers records; resolve all stale live references.
5. Run formatting, linting, typechecking, build, documentation-drift checks, and the two
   Vitest projects according to repository guidance.
6. Rename the GitHub repository and local directory, update `origin`, and verify links and
   repository state.

## Validation

The implementation is complete when:

- Workspace package names and all live internal imports resolve under the new names.
- The dependency graph remains primitive components → API components → demo/docs.
- CEM generation and `docs:check` pass without stale generated references.
- Formatting, linting, typechecking, build, client tests, component tests, and the full test
  suite pass, or any environment limitation is reported explicitly.
- No old package/repository names remain in live tracked source, configuration, or guidance.
- The GitHub remote and local directory use `zocdoc-api-components`.

## Alternatives considered

### Rename only the API package

Rejected because the primitive dependency would retain a mixed old scope and would not share
the new public package identity.

### Add compatibility aliases

Rejected because there are no external consumers and aliases would add unnecessary release and
maintenance work.

### Rename packages and repository in separate phases

Rejected because it would leave package documentation and repository links temporarily
inconsistent and require a second migration.
