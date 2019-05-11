# Conventional Commit Release Notes Generator for GitHub
> Use the Conventional Commits standard to auto-generate release notes.

## Getting Started

The tool will output in the terminal the Markdown release notes which you can apply to the relevant tag. Automation
coming soon.

Checkout this repository as a submobile in your desired project for which you want to generate release notes. Install the
following command as a script.

```
node --experimental-modules tools/conventionalGitReleaser/index.mjs
```

For example:

```
{
  "scripts": {
    "release:notes": "node --experimental-modules tools/conventionalGitReleaser/index.mjs"
  }
}
```
