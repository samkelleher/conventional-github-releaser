import conventionalGitReleaser from "./conventionalGitReleaser.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";

const isDraft = process.argv.includes('--draft');

const cwd = process.cwd();
getBundleReportStats(cwd)
    .then((assets) => {
        let extra = '';

        if (assets) {
            extra += '### Bundle Sizes\n\n';
            extra += '| Chunk        | File         | Size         |\n';
            extra += '| ------------ | ------------ | ------------ |\n';
            assets.forEach(asset => {
                extra += `| ${asset.name} | ${asset.fileName} | ${asset.sizeHuman} |\n`;
            });
        }

        return conventionalGitReleaser(extra, true, isDraft);
    })
    .then((result) => {
        console.log(result);
    })
    .catch(error => {
        console.log(error);
        throw error;
    });
