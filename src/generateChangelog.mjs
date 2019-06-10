import conventionalChangelog from "conventional-changelog-core";
import conventionalCommits from "conventional-changelog-conventionalcommits";
import datefns from 'date-fns';
import { isVersion } from "./getTags.mjs";
import template from './templates/template.mjs';

/**
 * The transform function is used after commit parsing, and allowing manipulation before
 * being given to the writer.
 */
function transformCommitForWriting(rawGit, cb) {
    let commit = { ...rawGit };
    commit.shortHash = commit.hash.substring(0, 7);
    if (typeof commit.gitTags === 'string') {
        commit.gitTags = commit.gitTags.trim();
        const versionMatches = commit.gitTags.match(isVersion);
        if (versionMatches && versionMatches.length > 0) {
            commit.version = versionMatches[0];
        }
    }

    if (commit.committerDate) {
        const originalDate = commit.committerDate;
        commit.sortDate = datefns.parse(originalDate).getTime() / 1000;
        commit.committerDateRaw = originalDate;
        commit.committerDate = datefns.format(originalDate, 'YYYY-MM-DD');
        commit.date = datefns.format(originalDate, 'YYYY-MM-DD');
        // commit.header = `${dateFns.format(originalDate, 'YYYY-MM-DD h:mma')}: ${commit.header}`;
        // if (commit.subject) {
        //   commit.subject = `${dateFns.format(originalDate, 'YYYY-MM-DD h:mma')}: ${commit.subject}`;
        // }
    }

    if (!commit.type) {
        // Non conformant commits will not show up otherwise.
        commit.type = 'misc';
        commit.subject = commit.header;
    }

    commit.isVerified = commit.gpgStatus === 'G';
    commit.mentions = []; // because author emails get picked up as mentions

    if (commit.authorName.indexOf(" ")) {
        commit.authorShortName = commit.authorName.slice(0, commit.authorName.indexOf(" "));
        commit.subject = `${commit.subject} - ${commit.authorShortName}`;

    } else {
        commit.authorShortName = commit.authorName;
    }

    if (commit.isVerified) {
        commit.subject = `${commit.subject} - Verified 🔒`;
    }

    cb(null, commit)
}

export default async function (to, from, extra, fullPr, isDraft, cwd = null) {
    // These options define how data is actually read from git, and how the stream is formatted
    const gitRawCommitsOpts = {
        format: '%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci%n-authorName-%n%an%n-authorEmail-%n%ae%n-gpgStatus-%n%G?%n-gpgSigner-%n%GS',
        to,
        from
    };
    const gitRawExecOpts = {
        cwd
    };

    if (fullPr) {
        gitRawCommitsOpts.merges = null;
        gitRawCommitsOpts['first-parent'] = true;
    }

    const context = {
        version: gitRawCommitsOpts.to,
        currentTag: gitRawCommitsOpts.to,
        previousTag: gitRawCommitsOpts.from,
        linkCompare: gitRawCommitsOpts.to !== gitRawCommitsOpts.from,
    };

    const changelogOpts = {
        releaseCount: 1,
        outputUnreleased: isDraft || false,
        transform: transformCommitForWriting
    };

    if (cwd) {
        changelogOpts.pkg = { path: `${cwd}/package.json` };
    }

    const mainTemplate = template;

    // This gets a standard set of config and formatting based on the 'conventionalcommits' style.
    const config = await conventionalCommits({
        types: [
            { type: 'feat', section: 'Features ✨' },
            { type: 'fix', section: 'Bug Fixes 🐞' },
            { type: 'perf', section: 'Performance Improvements ⏱' },
            { type: 'revert', section: 'Reverts 🧨' },
            { type: 'docs', section: 'Documentation 📔' },
            { type: 'style', section: 'Styles 🎨' },
            { type: 'chore', section: 'Miscellaneous Chores 🔨' },
            { type: 'refactor', section: 'Code Refactoring 🧹' },
            { type: 'test', section: 'Tests ✅' },
            { type: 'build', section: 'Build System 📦' },
            { type: 'ci', section: 'Continuous Integration 🔀' },
            { type: 'misc', section: 'Miscellaneous 👨‍💻👩‍💻' }
        ]
    });

    // Options given to 'conventional-commits-parser'. when evaluating each commit.
    const parserOpts = {
        ...config.parserOpts,
        // debug: message => console.log(message),
    };

    // Options given to 'conventional-changelog-writer', when writing each commit to the document.
    const writerOpts = {
        ...config.writerOpts,
        commitsSort: [ 'scope', 'subject', 'sortDate' ],
        // generateOn: function (commit) {
        //     // Build in generateOn uses mandatory semVer validation.
        //     if (!commit.version) return false;
        //     const matches = commit.version.match(isVersion);
        //     return matches && matches.length > 0;
        // },
        finalizeContext: context => {
            let dateTitle = context.date;
            if (context.committerDateRaw) {
                const dateTitleFriendly = datefns.format(datefns.parse(context.committerDateRaw), "ddd, MMMM Do YYYY, h:mma");
                dateTitle = dateTitleFriendly;
            }
            return {
                ...context,
                date: dateTitle,
                extra
            };
        },
        mainTemplate // custom template with a footer for rendering 'extra'
    };

    const chunks = [];

    const body = await new Promise((resolve, reject) => {
        conventionalChangelog(changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts, gitRawExecOpts)
        // .pipe(process.stdout)
            .on('data', chunk => {
                chunks.push(chunk)
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('end', function () {
                const result = Buffer.concat(chunks).toString('utf8');
                resolve(result);
            });
    });

    if (!body || !body.length) {
        console.log(`No report from ${gitRawCommitsOpts.from} to ${gitRawCommitsOpts.to}`);
    }

    return {
        body,
        version: context.version,
        previousTag: context.previousTag
    }
}
