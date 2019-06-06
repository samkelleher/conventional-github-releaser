import path from 'path';
import fs from 'fs';

const fsPromises = fs.promises;

const fileExists = async path => {
    try {
        await fsPromises.access(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File not exists
            return false;
        }
        return null;
    }
    return true;
};

const readJSON = async path => {
    let reportDataString;

    try {
        reportDataString = await fsPromises.readFile(path, {
            encoding: 'utf8'
        });
    } catch (error) {
        console.error(`Failed to read report at "${path}"`);
        console.error(error);
        return;
    }

    let reportData;
    try {
        reportData = JSON.parse(reportDataString)
    } catch(error) {
        console.error(`Failed to parse report at "${path}"`);
        console.error(error);
        return;
    }

    return reportData;
};

export default async function (cwd) {
    const version = process.env.APP_VERSION;

    if (!version) {
        console.warn('Not including bundle information as env var "APP_VERSION" is not present.');
        return undefined;
    }

    // The path the build container will mount the report.
    let reportPath = path.join(cwd, `./${version}-bundle-data.json`);

    if (!await fileExists(reportPath)) {
        // Look up in the reports directory
        // This is when we run the tool directly in repo
        reportPath = path.join(cwd, `./reports/${version}-bundle-data.json`);
    }

    if (!await fileExists(reportPath)) {
        console.warn(`Did not find report file at ${reportPath}`);
        return;
    }

    const stats = await readJSON(reportPath);

    if (!stats) return;

    const friendlyAssets = stats.assets.map(asset => (
        {
            name: asset.chunkNames[0],
            size: asset.size,
            fileName: asset.name,
            sizeHuman: asset.size > 1000 ? `${Math.floor(asset.size / 1000)}KB` : `${asset.size} bytes`
        }
    ));

    return friendlyAssets;
}
