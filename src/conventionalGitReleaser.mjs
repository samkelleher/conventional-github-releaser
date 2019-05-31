import conventionalChangelog from "conventional-changelog-core";
import conventionalCommits from "conventional-changelog-conventionalcommits";
import dateFns from "date-fns";
import getTags, { isVersion } from "./getTags.mjs";

/**
 * The transform function is used after commit parsing, and allowing manipulation before
 * being given to the writer.
 */
function transformCommitForWriting(rawGit, cb) {
    let commit = { ...rawGit };
    if (typeof commit.gitTags === 'string') {
        commit.version = (commit.gitTags.match(isVersion) || [])[0]
    }

    if (commit.committerDate) {
        const originalDate = commit.committerDate;
        commit.committerDate = dateFns.format(originalDate, 'YYYY-MM-DD');
        commit.date = dateFns.format(originalDate, 'YYYY-MM-DD');
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
    delete commit.mentions; // because author emails get picked up as mentions

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

export default async function (notes) {
    // 1. Get the last two versions, changes between this will be documented.
    const tags = await getTags();

    // These options define how data is actually read from git, and how the stream is formatted
    const gitRawCommitsOpts = {
        format: '%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci%n-authorName-%n%an%n-authorEmail-%n%ae%n-gpgStatus-%n%G?%n-gpgSigner-%n%GS',
        to: tags[0],
        from: tags[1],
    };

    const context = {
        version: gitRawCommitsOpts.to,
        currentTag: gitRawCommitsOpts.to,
        previousTag: gitRawCommitsOpts.from,
        linkCompare: true
    };

    const changelogOpts = {
        releaseCount: 1,
        //config,
        transform: transformCommitForWriting
    };

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
        ...config.parserOpts
    };

    // Options given to 'conventional-changelog-writer', when writing each commit to the document.
    const writerOpts = {
        ...config.writerOpts,
        commitsSort: [ 'scope', 'subject', 'committerDate' ],
        // debug: message => console.log(message),
        finalizeContext: context => {
            return {
                ...context,
                noteGroups: [
                    ...context.noteGroups,
                    ...notes
                ]
            };
        }
        // headerPartial: ''
    };

    const chunks = [];

    return new Promise((resolve, reject) => {
        conventionalChangelog(changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts)
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
}
