import conventionalChangelog from "conventional-changelog";
import getTags, { isVersion } from "./getTags.mjs";

function transform (chunk, cb) {
  if (typeof chunk.gitTags === 'string') {
    chunk.version = (chunk.gitTags.match(isVersion) || [])[0]
  }

  if (chunk.committerDate) {
    console.log(chunk.committerDate);
    // chunk.committerDate = dateFormat(chunk.committerDate, 'yyyy-mm-dd', true)
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

  const context = {

  };
  const changelogOpts = {
    releaseCount: 1,
    // transform
  };
  const parserOpts = {

  };
  const writerOpts = {
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
        // const result = Buffer.concat(chunks).toString('utf8');
        console.log(chunks[0].log);
        resolve(chunks);
      });
  });


  // console.log(gitRawCommitsOpts);
}
