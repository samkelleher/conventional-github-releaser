import generateChangelog from "./generateChangelog.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";
import uploadToGithub from "./uploadToGithub.mjs";

export default async () => {
    const isDraft = process.argv.includes('--draft');

    const cwd = process.cwd();
    const statsReport = await getBundleReportStats(cwd);

    let extra = '';

    if (statsReport) {
        extra += '### Bundle Sizes 📦\n\n';
        extra += '| Chunk        | File         | Size         |\n';
        extra += '| ------------ | ------------ | ------------ |\n';
        const clientChunk = statsReport.assets.find(asset => asset.name === 'client');
        const vendorChunk = statsReport.assets.find(asset => asset.name === 'vendor');
        const lazyAssets = statsReport.assets.filter(asset => asset.name !== 'client' && asset.name !== 'vendor').sort((a, b) => b.name - a.name);

        extra += [vendorChunk, clientChunk, ...lazyAssets].map(asset => `| ${asset.name} ${asset.name === 'vendor' || asset.name === 'client' ? '📥' : ''} | ${asset.fileName} | ${asset.sizeHuman} |`).join('\n');
    }

    const appVersion = process.env.APP_VERSION; // short git hash = 015e3d2
    const appTag = process.env.APP_TAG; // version = v1.2.3

    const changelog = await generateChangelog(extra, true, isDraft, appVersion, appTag);

    console.log(changelog.body);

    await uploadToGithub(changelog, statsReport);
}
