import generateChangelog from "./generateChangelog.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";
import uploadToGithub from "./uploadToGithub.mjs";

export default async () => {
    const isDraft = process.argv.includes('--draft');

    const cwd = process.cwd();
    const assets = await getBundleReportStats(cwd);

    let extra = '';

    if (assets) {
        extra += '### Bundle Sizes\n\n';
        extra += '| Chunk        | File         | Size         |\n';
        extra += '| ------------ | ------------ | ------------ |\n';
        assets.forEach(asset => {
            extra += `| ${asset.name} | ${asset.fileName} | ${asset.sizeHuman} |\n`;
        });
    }

    const changelog = await generateChangelog(extra, true, isDraft);

    console.log(changelog.body);

    await uploadToGithub(changelog);
}
