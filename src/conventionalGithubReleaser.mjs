import generateChangelog from "./generateChangelog.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";
import uploadToGithub from "./uploadToGithub.mjs";
import getTags from "./getTags.mjs";

export default async () => {
    const isDraft = process.argv.includes('--draft');
    const appVersion = process.env.APP_VERSION; // short git hash = 015e3d2
    const appTag = process.env.APP_TAG; // version = v1.2.3

    // 1. Get the last two versions, changes between this will be documented.

    let tags;

    try {
        tags = await getTags();
    } catch (error) {
        console.error('Failed to get tags.');
        console.error(error);
        tags = [];
    }

    const to = tags.length > 0 ? tags[0].tag : appVersion || 'HEAD';
    const from = tags.length > 1 ? tags[1].tag : to;

    const cwd = process.cwd();
    const statsReport = await getBundleReportStats(cwd);

    let extra = '';

    if (statsReport) {
        extra += '### Bundle Sizes 📦\n\n';
        extra += '| Chunk        | File         | Size         |\n';
        extra += '| ------------ | ------------ | ------------ |\n';
        const clientChunk = statsReport.assets.find(asset => asset.name === 'client');
        const vendorChunk = statsReport.assets.find(asset => asset.name === 'vendor');
        const lazyAssets = statsReport.assets.filter(asset => asset.name !== 'client' && asset.name !== 'vendor').sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        });

        if (clientChunk) lazyAssets.unshift(clientChunk);
        if (vendorChunk) lazyAssets.unshift(vendorChunk);

        extra += lazyAssets.map(asset => `| ${asset.name} ${asset.name === 'vendor' || asset.name === 'client' ? '📥' : ''} | ${asset.fileName} | ${asset.sizeHuman} |`).join('\n');
    }

    const changelog = await generateChangelog(to, from, extra, true, isDraft);

    console.log(changelog.body);

    await uploadToGithub(changelog, statsReport);
}
