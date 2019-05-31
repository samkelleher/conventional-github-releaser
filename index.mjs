import conventionalGitReleaser from "./src/conventionalGitReleaser.mjs";
import getBundleReportStats from "./src/getBundleReportStats.mjs";

const cwd = process.cwd();
getBundleReportStats(cwd)
    .then((assets) => {
        console.log(assets);
        return conventionalGitReleaser();
    })
    .then((result) => {
        console.log(result);
    })
    .catch(error => {
        throw error;
    });
