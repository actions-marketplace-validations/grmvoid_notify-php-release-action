# Notify PHP Release Action

[![CI](https://github.com/sxbrsky/notify-php-release-action/actions/workflows/main.yml/badge.svg)](https://github.com/sxbrsky/notify-php-release-action/actions/workflows/main.yml)

A GitHub Action that opens an issue when a PHP release is not present in your
repository's releases file. Repeated workflow runs are safe: the action searches
for an issue with the same title before creating a new one, including closed
issues.

## How it works

The action:

1. fetches the latest PHP releases with
   [`latest-php-releases-action`](https://github.com/sxbrsky/latest-php-releases-action),
2. reads the versions currently used by the repository,
3. ignores releases already listed in that file, and
4. creates one issue for each remaining version.

Generated issue titles use the following format:

```text
build: bump PHP release to 8.4.1
```

## Usage

Create a file such as `.releases` containing one PHP version per line:

```text
8.3.7
8.2.19
```

Blank lines and surrounding whitespace are ignored. Then add a workflow:

```yaml
name: Check PHP releases

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  notify-new-releases:
    runs-on: ubuntu-latest
    steps:
      - name: Check for new PHP releases
        uses: sxbrsky/notify-php-release-action@v1
        with:
          repo-token: ${{ github.token }}
          owner: ${{ github.repository_owner }}
          repo: ${{ github.event.repository.name }}
          localfile: .releases
```

The `issues: write` permission is required to create issues. The action checks
out the repository so it can read the configured releases file.

## Inputs

| Input        | Description                                              | Required | Default               |
| ------------ | -------------------------------------------------------- | -------- | --------------------- |
| `localfile`  | Path to the file containing current PHP versions.        | No       | `.releases`           |
| `repo-token` | Token used to search for and create issues.              | Yes      | `${{ github.token }}` |
| `owner`      | Account or organization that owns the target repository. | Yes      | —                     |
| `repo`       | Target repository name without the `.git` suffix.        | Yes      | —                     |

## Failure conditions

The workflow fails with a descriptive error when:

- a required input is empty,
- the releases file does not exist or cannot be read,
- the upstream releases output is malformed, or
- GitHub's API rejects an issue search or creation request.

## Development

Node.js 20 or newer is required.

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

GitHub Actions executes the committed bundle from `dist/`. Run `npm run build`
and commit the generated files whenever source code or runtime dependencies
change.

## License

Released under the [MIT License](LICENSE).
