import path from 'path';

export default async function (cwd) {
    const version = process.env.APP_VERSION;

    if (!version) {
        console.warn('Not including bundle information as env var "APP_VERSION" is not present.');
        return undefined;
    }

    const reportPath = path.join(cwd, `./reports/${version}-bundle-data.json`);

    let stats;
    try {
        stats = await import(reportPath);
        stats = stats.default; // why?
    } catch (error) {
        console.error(`Unable to read stats file at ${reportPath}`);
        console.error(error);
        return;
    }

    console.log(stats.assets);

    const friendlyAssets = stats.assets.map(asset => (
        {
            name: asset.chunkNames[0],
            size: asset.size,
            fileName: asset.name
        }
    ));

    return friendlyAssets;
}
