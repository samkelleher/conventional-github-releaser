import conventionalChangelog from "conventional-changelog-core";
import conventionalCommits from "conventional-changelog-conventionalcommits";
import dateFns from "date-fns";
import getTags, { isVersion } from "./getTags.mjs";

function transform (chunk, cb) {
  if (typeof chunk.gitTags === 'string') {
    chunk.version = (chunk.gitTags.match(isVersion) || [])[0]
  }

  if (chunk.committerDate) {
    const originalDate = chunk.committerDate;
    chunk.committerDate = dateFns.format(originalDate, 'YYYY-MM-DD');
    chunk.date = dateFns.format(originalDate, 'YYYY-MM-DD');
    // chunk.header = `${dateFns.format(originalDate, 'YYYY-MM-DD h:mma')}: ${chunk.header}`;
    // if (chunk.subject) {
    //   chunk.subject = `${dateFns.format(originalDate, 'YYYY-MM-DD h:mma')}: ${chunk.subject}`;
    // }
  }

  if (!chunk.type) {
    // Non conformant commits will not show up otherwise.
    chunk.type = 'misc';
    chunk.subject = chunk.header;
  }

  cb(null, chunk)
}

export default async function () {
  // 1. Get the last two versions, changes between this will be documented.
  const tags = await getTags();
  const gitRawCommitsOpts = {
    to: tags[0],
    from: tags[1]
  };

  const config = await conventionalCommits({
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'perf', section: 'Performance Improvements' },
      { type: 'revert', section: 'Reverts' },
      { type: 'docs', section: 'Documentation' },
      { type: 'style', section: 'Styles' },
      { type: 'chore', section: 'Miscellaneous Chores' },
      { type: 'refactor', section: 'Code Refactoring' },
      { type: 'test', section: 'Tests' },
      { type: 'build', section: 'Build System' },
      { type: 'ci', section: 'Continuous Integration' },
      { type: 'misc', section: 'Miscellaneous' }
    ]
  });

  config.writerOpts.commitsSort.push("committerDate");

  const context = {
    version: gitRawCommitsOpts.to,
    currentTag: gitRawCommitsOpts.to,
    previousTag: gitRawCommitsOpts.from,
    linkCompare: true
  };
  const changelogOpts = {
    releaseCount: 1,
    //config,
    transform
  };
  const parserOpts = config.parserOpts || {

  };
  const writerOpts = config.writerOpts || {
    includeDetails: true,
    headerPartial: ''
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
