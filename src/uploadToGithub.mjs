import fs from 'fs';
import fetch from 'node-fetch';

const fsPromises = fs.promises;

const getRelease = async (githubOwner, githubRepo, tag, token) => {
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/releases/tags/${encodeURI(tag)}`;
    let release;
    try {
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Bearer ${token}`
                }
            });
        if (response.status === 404) {
            return undefined;
        }
        release = await response.json();
    } catch (error) {
        console.error(`Failed to get existing release for ${tag}`);
        console.error(error);
        return undefined;
    }
    return release;
};

const createRelease = async (githubOwner, githubRepo, tag, token, body) => {
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/releases`;
    let release;
    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    "tag_name": tag,
                    "name": tag,
                    "draft": false,
                    "prerelease": false,
                    "body": body
                })
            });
        release = await response.json();
    } catch (error) {
        console.error(`Failed to upload changelog for ${tag}`);
        console.error(error);
        return undefined;
    }
    return release;
};

const updateRelease = async (githubOwner, githubRepo, tag, token, body, existingRelease) => {
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/releases/${existingRelease.id}`;
    let release;
    try {
        const response = await fetch(url,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    "tag_name": tag,
                    "name": tag,
                    "draft": existingRelease.draft,
                    "prerelease": existingRelease.prerelease,
                    "body": body
                })
            });

        release = await response.json();
    } catch (error) {
        console.error(`Failed to upload changelog for ${tag}`);
        console.error(error);
        return undefined;
    }
    return release;
};

const uploadReleaseAsset = async (githubOwner, githubRepo, releaseId, token, filePath, fileName, displayName) => {
    const stats = await fsPromises.stat(filePath);
    const fileSizeInBytes = stats.size;
    let fileContentType = "";

    if (fileName.endsWith('html')) {
        fileContentType = 'text/html';
    } else if (fileName.endsWith('json')) {
        fileContentType = 'application/json';
    }

    const readStream = fs.createReadStream(filePath);
    const url = `https://uploads.github.com/repos/${githubOwner}/${githubRepo}/releases/${releaseId}/assets?name=${encodeURI(fileName)}&label=${encodeURI(displayName)}`;
    let upload;

    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Length": fileSizeInBytes,
                    "Content-Type": fileContentType,
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Bearer ${token}`
                },
                body: readStream
            });
        upload = await response.json();
    } catch (error) {
        console.error(`Failed to upload asset ${filePath} for ${releaseId}`);
        console.error(error);
        return undefined;
    }
    return upload;
};

export default async (changelog, statsReport) => {
    const noUpload = process.argv.includes('--no-upload');
    const noAssets = process.argv.includes('--no-assets');

    if (noUpload) return;
    const githubRepo = process.env.GITHUB_REPO;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubToken = process.env.GITHUB_API_TOKEN;

    if (!githubOwner || !githubRepo || !githubToken) {
        return undefined;
    }

    if (changelog.version === 'HEAD') return;

    const existingRelease = await getRelease(githubOwner, githubRepo, changelog.version, githubToken);

    let newOrUpdatedRelease;

    if (!existingRelease) {
        newOrUpdatedRelease = await createRelease(githubOwner, githubRepo, changelog.version, githubToken, changelog.body);
    } else {
        newOrUpdatedRelease = await updateRelease(githubOwner, githubRepo, changelog.version, githubToken, changelog.body, existingRelease);
    }

    if (!noAssets && newOrUpdatedRelease && statsReport && statsReport.statsFilePath) {
        await uploadReleaseAsset(githubOwner, githubRepo, newOrUpdatedRelease.id, githubToken, statsReport.statsFilePath, statsReport.statsFileName, statsReport.statsDisplayName);
    }

    if (!noAssets && newOrUpdatedRelease && statsReport && statsReport.reportFilePath) {
        await uploadReleaseAsset(githubOwner, githubRepo, newOrUpdatedRelease.id, githubToken, statsReport.reportFilePath, statsReport.reportFileName, statsReport.reportDisplayName);
    }

    return newOrUpdatedRelease;
}
