import { exec } from "child_process";

const tagRegex = /tag:\s*(.+?)[,)]/gi;
export const isVersion = /v[0-9]+\.[0-9]+(?:\.[0-9]+)?/gi;
const cmd = 'git log --no-color --format=%H%d';

export default async function () {
    return new Promise((resolve, reject) => {
        exec(cmd, {
            maxBuffer: Infinity
        }, function (err, data) {
            if (err) {
                reject(err);
                return;
            }

            const tagsFound = [];

            const commits = data.split('\n');

            commits.forEach(function (decorations) {
                // 503b6daa93e7a1b911ec6a2c5b50c121ddcbf829 (HEAD -> master, tag: v3.18, origin/master, origin/HEAD)
                // b93e05bc32ed3cfeedc53d0c851d4bb6dab1ad8f (tag: v3.16)
                let match;
                const hash = decorations.slice(0, decorations.indexOf(' '));

                while ((match = tagRegex.exec(decorations))) {

                    let tag = match[1];
                    const matches = tag.match(isVersion);
                    if (matches && matches.length > 0) {
                        tagsFound.push({
                            tag,
                            hash
                        });
                    }
                }
            });

            resolve(tagsFound)
        })
    });
}
