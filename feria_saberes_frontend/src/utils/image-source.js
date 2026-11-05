export function getImageSource(url) {
  if (typeof url !== "string") return "";

  const imageUrl = url.trim();
  const markdownLink = imageUrl.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/);
  return markdownLink ? markdownLink[1] : imageUrl;
}
