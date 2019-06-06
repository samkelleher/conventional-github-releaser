# Conventional Commit Release Notes Generator for GitHub
> Use the Conventional Commits standard to auto-generate release notes.

## Getting Started

The tool will output in the terminal the Markdown release notes which you can apply to the relevant tag. Automation
coming soon.

Checkout this repository as a submobile in your desired project for which you want to generate release notes. Install the
following command as a script.  Or you could use the Docker workflow described below.

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

For the report to work best, your project should use commits that conform to the [Conventional Commit](https://www.conventionalcommits.org) standard, and you
can use a [CLI tool](https://github.com/commitizen/cz-cli) to guide developers to write commits in this format.

## Docker Usage

The utility can simply be added to your existing build workflow by consuming it as a Docker container. Simply mount
your sourcecode to a `/workspace` volume and start the container. The changelog will be output.  If you use Google Cloud
Build, then this mount is done automatically. See the `yarn start:docker` for an example"

This command will run the container on the current git directory and output the changelog.

```
docker run --rm -it -v $(pwd):/workspace conventional-github-releaser/conventional-github-releaser
```

## Building and Commands

The script is compiled using Rollup and added to a Docker image.

- `yarn start` to run the script on the current repo, great for testing.
- `yarn build` to generate the runtime script and output it into the `dist` directory/
- `yarn build:docker` to generate the Docker image.

## Background

This tool is based upon the [Conventional Changelog Github Releaser](https://github.com/conventional-changelog/releaser-tools/tree/master/packages/conventional-github-releaser)
which is a prebuilt tool for grabbing commits and publishing a release notes on GitHub, I wanted to extend the formatting and the grabbing of different tag
types in projects that do not adhere to SemVer (for example in website projects where semver makes little practical sense).

The tool uses the preset [Conventional Commits Preset](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits) which itself is
based upon the [Conventional Changelog Spec](https://github.com/conventional-changelog/conventional-changelog-config-spec).

The spec for commits outlines the format of each specific commit, while the changelog spec outlines how these commits are grouped, formatted, and placed under semver control. Two different specs, but easy to get mixed up.

## How this tool differs

* Applies custom formatting over the existing preset.
* Allows non-semver version tags.
* Is triggered after tagging with no additonal commits. This enables full image promotion rather than making a release commit and rebuilding. Thus this tool does not generate tags, suggestion version numbers, or make git commits.
* It uses the latest generation ECMAScript.
