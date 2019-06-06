import generateChangelog from "./generateChangelog.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";
import uploadToGithub from "./uploadToGithub.mjs";

export default async () => {
    const isDraft = process.argv.includes('--draft');

    const cwd = process.cwd();
    const statsReport = await getBundleReportStats(cwd);

    let extra = '';

    if (statsReport) {
        extra += '### Bundle Sizes\n\n';
        extra += '| Chunk        | File         | Size         |\n';
        extra += '| ------------ | ------------ | ------------ |\n';
        statsReport.assets.forEach(asset => {
            extra += `| ${asset.name} | ${asset.fileName} | ${asset.sizeHuman} |\n`;
        });
    }

    const appVersion = process.env.APP_VERSION; // short git hash = 015e3d2
    const appTag = process.env.APP_TAG; // version = v1.2.3

    const changelog = await generateChangelog(extra, true, isDraft, appVersion, appTag);

    console.log(changelog.body);

    await uploadToGithub(changelog, statsReport);
}
