import getTags from "./getTags.mjs";

export default async function () {
  const tags = await getTags();
  console.log(tags);
}
