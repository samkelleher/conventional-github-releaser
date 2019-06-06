import conventionalGithubReleaser from "./conventionalGithubReleaser.mjs";

conventionalGithubReleaser()
    .catch(error => {
        console.error('Failed 💀');
        console.error(error);
        process.exit(1);
    });
