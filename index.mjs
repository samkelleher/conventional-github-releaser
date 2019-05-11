import conventionalGitReleaser from "./src/conventionalGitReleaser.mjs";

conventionalGitReleaser()
  .then(() => console.log("Complete"))
  .catch(error => { throw error; });
