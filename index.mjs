import conventionalGitReleaser from "./src/conventionalGitReleaser.mjs";

conventionalGitReleaser()
  .then((result) => { console.log(result); })
  .catch(error => { throw error; });
