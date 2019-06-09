import generateChangelog from "./generateChangelog.mjs";
import getBundleReportStats from "./getBundleReportStats.mjs";
import uploadToGithub from "./uploadToGithub.mjs";
import getTags from "./getTags.mjs";

const sortByName = (a, b) => {
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
};

const primaryChunkNames = ['vendor', 'client', 'main'];

export default async () => {
    const isDraft = process.argv.includes('--draft');
    const appVersion = process.env.APP_VERSION; // short git hash = 015e3d2
    const appTag = process.env.APP_TAG; // version = v1.2.3

    // 1. Get the last two versions, changes between this will be documented.

    const gitCwd = process.env.REPO_PATH || null;

    let tags;

    try {
        tags = await getTags(gitCwd);
    } catch (error) {
        console.error('Failed to get tags.');
        console.error(error);
        tags = [];
    }

    // By default, select the last 2 tags.
    let to = tags.length > 0 ? tags[0].tag : appVersion || 'HEAD';
    let from = tags.length > 1 ? tags[1].tag : to;

    // When draft, get the current latest commit to the last tag instead.
    if (from !== to && isDraft) {
        to = 'HEAD';
        from = to;
    }

    if (appTag && to !== appTag) {
        const desiredToTag = tags.find(tag => tag.tag === appTag);
        let desiredTagPosition;
        let desiredFromTag;
        if (desiredToTag) {
            desiredTagPosition = tags.indexOf(desiredToTag);
            if (tags.length > (desiredTagPosition + 1)) {
                desiredFromTag = tags[desiredTagPosition + 1]; // get next tag
            } else {
                // There are no more tags, so this must be the first tag for this repo.
                // TODO: Walk back to the first commit instead
                desiredFromTag = desiredToTag;
            }
            to = desiredToTag.tag;
            from = desiredFromTag.tag;
        }
    }

    const cwd = process.cwd();
    const statsReport = await getBundleReportStats(cwd);

    let extra = '';

    if (statsReport) {
        extra += '### Bundle Sizes 📦\n\n';
        extra += '| Chunk        | File         | Size         |\n';
        extra += '| ------------ | ------------ | ------------ |\n';
        const primaryChunks = statsReport.assets.filter(asset => primaryChunkNames.includes(asset.name)).sort(sortByName);
        const lazyAssets = statsReport.assets.filter(asset => !primaryChunkNames.includes(asset.name)).sort(sortByName);
        extra += primaryChunks.map(asset => `| ${asset.name} 📥 | ${asset.fileName} | ${asset.sizeHuman} |`).join('\n');
        extra += lazyAssets.map(asset => `| ${asset.name} | ${asset.fileName} | ${asset.sizeHuman} |`).join('\n');
    }

    const changelog = await generateChangelog(to, from, extra, false, gitCwd);

    const newGithubRelease = await uploadToGithub(changelog, statsReport);

    if (newGithubRelease) {
        console.log(`Version ${newGithubRelease.name} uploaded to GitHub ${newGithubRelease.html_url}`);
    }

    console.log(changelog.body);
}
