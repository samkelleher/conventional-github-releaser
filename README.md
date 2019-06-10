# Conventional Commit Release Notes Generator for GitHub
> Use the Conventional Commits standard to auto-generate release notes.

## Getting Started

This tool is designed to be consumed as a Docker image and called as part of your CI pipeline. It is optimised to run
following an application promotion workflow. This project uses itself to generate it's own changelogs using Google Cloud
Build, so examine the [cloudbuild.latest.yaml](cloudbuild.latest.yaml) file for reference on how to consume it.

For the report to work best, your project should use commits that conform to the [Conventional Commit](https://www.conventionalcommits.org) standard, and you
can use a [CLI tool](https://github.com/commitizen/cz-cli) to guide developers to write commits in this format.

## Docker Usage

The utility can simply be added to your existing build workflow by consuming it as a Docker container. Simply mount
your source code to a `/workspace` volume and start the container. The changelog will be output.  If you use Google Cloud
Build, then this mount is done automatically.

This command will run the container on the current git directory and output the changelog.

```
docker run --rm -it -v $(pwd):/workspace gcr.io/conventional-github-releaser/conventional-github-releaser
```

## Configuration

To enable automatic publishing to Github Releases, you need to configure the following environment variables.

- `GITHUB_API_TOKEN` - A personal access token with 'repo' permissions.
- `GITHUB_REPO` - The name of the repository that will have the changelog written to.
- `GITHUB_OWNER` - The name of the repository owner. This is the organisation name or personal username on Github.

To enable automatic examination and upload of Webpack bundle stats file and reports, set the following environment variable.

- `APP_VERSION` The short git has of the commit that is being promoted. Usually the current git short SHA. For example, if
you set the value to `015e3d2`, then this tool will look for `015e3d2-bundle-data.json` and `015e3d2-bundle-report.html` in the current
working directory, if none is found, it will also look in a `./reports/` directory if it exists.  You should ensure
that the relevant file is unarchived by your build system in advance of running this tool.

If you want to run the changelog for a tag that is not the latest, then set the following variable:

- `APP_TAG`, set this to the git tag that should be reported. When omitted, by default a change log will be generated
from the latest git tag and the one previous to it.  Tags *must* be semver based.  If you want to generate an older report,
set the `APP_TAG` to the tag. If the tag is not found, it is ignored and revert to default behaviour.

You can also create draft releases, by including `--draft` in the command line as a argument. This will generate a report
from the current commit from the last previous tag. No upload or release publish will take place.  If an `APP_TAG` is specified,
then the `--draft` flag is ignored.

If you commit direct to the working branch, then this tool will analyse conventional commit formatted commits to produce the
report. Say however, you run a full Pull Request workflow, then you will have only merge and squash commits that cannot be analysed.
This means the report will have no data, so you should include the `--pull-request-based` command line argument telling
the tool to include merge commits.

You can also prevent the upload of GitHub Release Notes by including the `--no-upload` arguments. The `--no-assets` argument
will upload the report, but not upload the relevant Webpack bundle results.

```
docker run --rm -it -v $(pwd):/workspace gcr.io/conventional-github-releaser/conventional-github-releaser --pull-request-based
```

## Building and Commands

The script is added to a Docker image without any compile steps.

- `yarn start` to run the script on the current repo, great for testing.
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
* Is triggered after tagging with no additional commits. This enables full image promotion rather than making a release commit and rebuilding. Thus this tool does not generate tags, suggestion version numbers, or make git commits.
* It uses the latest generation ECMAScript.
* Examines and uploads Webpack Bundle files for statistical analysis.
* Consumed via Docker
