
/**
 * Asynchronously sorts articles by their posting time, newest first.
 *
 * @async
 * @function sortArticlesByAge
 * @param {Article[]} articles - Array of articles to sort.
 * @returns {Promise<Article[]>} A promise that resolves with the input array sorted in-place (highest `ageEpoch` → lowest).
 *
 * @typedef {Object} Article
 * @property {string} title     – Article title.
 * @property {string} link      – URL to the article.
 * @property {string} rank      – Displayed rank (e.g. "1.").
 * @property {number} ageEpoch  – UNIX timestamp (seconds).
 * @property {string} ageDate   – ISO 8601 date string.
 *
 * @example
 * const sorted = await sortArticlesByAge(articles);
 * console.log(sorted[0].ageDate); // Newest article date
 */
export async function sortArticlesByAge(articles) {
  return articles.sort((a, b) => b.ageEpoch - a.ageEpoch);
}

/**
 * Checks that articles are sorted by `ageEpoch` in descending order (newest → oldest).
 *
 * @async
 * @function verifySortedArticles
 * @param {Article[]} articles - Array of articles to verify.
 * @returns {Promise<boolean>} Resolves to `true` if sorted correctly; otherwise `false`.
 *
 * @typedef {Object} Article
 * @property {string} title     – Article title.
 * @property {string} link      – URL to the article.
 * @property {string} rank      – Displayed rank (e.g. "1.").
 * @property {number} ageEpoch  – UNIX timestamp (seconds).
 * @property {string} ageDate   – ISO 8601 date string.
 *
 * @example
 * const isSorted = await verifySortedArticles(articles);
 * if (!isSorted) {
 *   console.warn("Articles are not sorted from newest to oldest.");
 * }
 */
export async function verifySortedArticles(articles) {
  for (let i = 0; i < articles.length - 1; i++) {
    const current = articles[i];
    const next = articles[i + 1];

    if (current.ageEpoch < next.ageEpoch) {
      console.error(
        `\x1b[31m[ERROR]\x1b[0m  [verifySortedArticles] Order error at index ${i}: ` +
        `"${current.title}" (epoch: ${current.ageEpoch}) is older than ` +
        `"${next.title}" (epoch: ${next.ageEpoch}).`
      ); // make red
      return false;
    }
  }

  return true;
}


/**
 * Confirms that the collected article count matches the expected total.
 *
 * @async
 * @function verifyArticleCount
 * @param {Article[]} articles        – Array of collected articles.
 * @param {number}    [expectedCount] – Expected number of articles (default: 100).
 * @returns {Promise<boolean>}        – Resolves to `true` if `articles.length === expectedCount`, otherwise `false`.
 *
 * @typedef {Object} Article
 * @property {string} title     – Article title.
 * @property {string} link      – URL to the article.
 * @property {string} rank      – Displayed rank (e.g. "1.").
 * @property {number} ageEpoch  – UNIX timestamp (seconds).
 * @property {string} ageDate   – ISO 8601 date string.
 *
 * @example
 * const isValid = await verifyArticleCount(articles, 50);
 * if (!isValid) {
 *   console.warn(`Expected 50 articles, but got ${articles.length}.`);
 * }
 */
export async function verifyArticleCount(
  articles = [],
  expectedCount = 100
) {

  const actualCount = Array.isArray(articles) ? articles.length : 0;
  if (actualCount !== expectedCount) {
    console.warn(`\x1b[33m[WARN]\x1b[0m  [verifyArticleCount] Mismatch: expected ${expectedCount}, but collected ${actualCount}.`); // make red
    return false;
  }
  return true;
}

