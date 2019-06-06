import fetch from 'node-fetch';

const createRelease = async (githubOwner, githubRepo, tag, token, body) => {
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/releases`;
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
        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
};

export default async (changelog) => {
    const version = process.env.APP_VERSION;
    const githubRepo = process.env.GITHUB_REPO;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubToken = process.env.GITHUB_API_TOKEN;

    if (!version || !githubOwner || !githubRepo || !githubToken) {
        return undefined;
    }

    const releaseCreated = await createRelease(githubOwner, githubRepo, changelog.version, githubToken, changelog.body);
}
