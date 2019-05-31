import conventionalGitReleaser from "./src/conventionalGitReleaser.mjs";
import getBundleReportStats from "./src/getBundleReportStats.mjs";

const cwd = process.cwd();
getBundleReportStats(cwd)
    .then((assets) => {
        const notes = [
            {
                title: 'Bundle Sizes',
                notes: assets.map(asset => ({
                    text: asset.summary
                }))
            }
        ];

        return conventionalGitReleaser(notes);
    })
    .then((result) => {
        console.log(result);
    })
    .catch(error => {
        throw error;
    });
