import conventionalChangelog from "conventional-changelog-core";
import conventionalCommits from "conventional-changelog-conventionalcommits";
import dateFns from "date-fns";
import getTags, { isVersion } from "./getTags.mjs";

function transform (chunk, cb) {
  if (typeof chunk.gitTags === 'string') {
    chunk.version = (chunk.gitTags.match(isVersion) || [])[0]
  }

  if (chunk.committerDate) {
    chunk.committerDate = dateFns.format(chunk.committerDate, 'YYYY-MM-DD');
  }
console.log(chunk);
  cb(null, chunk)
}

export default async function () {
  // 1. Get the last two versions, changes between this will be documented.
  const tags = await getTags();
  const gitRawCommitsOpts = {
    to: tags[0],
    from: tags[2]
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
      { type: 'ci', section: 'Continuous Integration' }
    ]
  });
  console.log(config);
  const context = {
    version: tags[0],
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
  console.log(gitRawCommitsOpts);
  const exec = config.conventionalChangelog || conventionalChangelog;
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
        console.log(result);
        resolve();
      });
  });


  // console.log(gitRawCommitsOpts);
}
