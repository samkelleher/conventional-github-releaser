import { exec } from "child_process";

const regex = /tag:\s*(.+?)[,)]/gi;
export const isVersion = /v[0-9]+\.[0-9]+(?:\.[0-9]+)?/gi;
const cmd = 'git log --decorate --no-color';


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

            data.split('\n').forEach(function (decorations) {
                let match;
                while ((match = regex.exec(decorations))) {

                    let tag = match[1];
                    const matches = tag.match(isVersion);
                    if (matches && matches.length > 0) {
                        tagsFound.push(tag);
                    }
                }
            });

            resolve(tagsFound)
        })
    });
}
