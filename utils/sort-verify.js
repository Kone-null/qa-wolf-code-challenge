
/**
 * Sorts an array of article objects by their `ageEpoch` in descending order (newest first).
 *
 * Articles with a higher `ageEpoch` are considered newer and will appear earlier in the array.
 * This function modifies the original array in-place and also returns it.
 *
 * @async
 * @function
 * @param {Article[]} articles - An array of article objects to be sorted.
 * @returns {Promise<Article[]>} A promise that resolves to the sorted array (newest to oldest).
 *
 * @typedef {Object} Article
 * @property {string} Article[].title - The article's title (e.g., "The Velvet Sundown officially confirm they're AI").
 * @property {string} link - The article's URL (e.g., "https://www.rollingstone.com/music/music-features/...").
 * @property {string} rank - The displayed rank of the article (e.g., "2.").
 * @property {number} ageEpoch - UNIX timestamp (in seconds) when the article was posted (e.g., 1751731294).
 * @property {string} ageDate - ISO 8601 date string derived from `ageEpoch` (e.g., "2025-07-05T16:01:34.000Z").
 *
 * @example
 * const sortedArticles = await sortArticlesByAge(articles);
 * console.log(sortedArticles[0].ageDate); // Should be the newest article
 */
async function sortArticlesByAge(articles) {

  return articles.sort((a, b) => b.ageEpoch - a.ageEpoch);

}

/**
 * Verifies that an array of articles is sorted in descending order by `ageEpoch` (newest to oldest).
 *
 * Iterates through the list and checks that each article has a greater-than-or-equal `ageEpoch`
 * compared to the next one. Logs an error with article titles if an out-of-order pair is found.
 *
 * @async
 * @function
 * @param {Article[]} articles - An array of article objects to verify.
 * @returns {Promise<boolean>} A promise that resolves to `true` if articles are correctly sorted, otherwise `false`.
 *
 * @typedef {Object} Article
 * @property {string} title - The title of the article (e.g., "The Velvet Sundown officially confirm they're AI").
 * @property {string} link - The URL to the article (e.g., "https://www.rollingstone.com/music/music-features/...").
 * @property {string} rank - The article's rank as shown on the page (e.g., "2.").
 * @property {number} ageEpoch - The article's timestamp as a UNIX epoch in seconds (e.g., 1751731294).
 * @property {string} ageDate - An ISO 8601 formatted date string derived from `ageEpoch` (e.g., "2025-07-05T16:01:34.000Z").
 *
 * @example
 * const isSorted = await verifySortedArticles(articles);
 * if (!isSorted) {
 *   console.warn("The articles list is not sorted correctly.");
 * }
 */
async function verifySortedArticles(articles) {
  // Verify Articles are sorted from newest to oldest.
  for (let i = 0; i < articles.length - 1; i++) {
    if (articles[i].ageEpoch < articles[i + 1].ageEpoch) {
      console.error(`Articles are not sorted correctly at index ${i}: ${articles[i].title} is older than ${articles[i + 1].title}`);
      return false;
    }
  }
  return true;
}


/**
 * Verifies that the number of collected articles matches the expected maximum.
 *
 * Logs an error if no articles were collected, and logs a warning if the count is not equal to `maximumArticles`.
 *
 * @async
 * @function
 * @param {Article[]} articles - An array of article objects to validate.
 * @param {number} maximumArticles - The expected number of articles to collect (default is 100).
 * @returns {Promise<boolean>} A promise that resolves to `true` if the article count matches the expected value, otherwise `false`.
 *
 * @typedef {Object} Article
 * @property {string} title - The title of the article (e.g., "The Velvet Sundown officially confirm they're AI").
 * @property {string} link - The URL to the article (e.g., "https://www.rollingstone.com/music/music-features/...").
 * @property {string} rank - The article's rank as shown on the page (e.g., "2.").
 * @property {number} ageEpoch - The article's timestamp as a UNIX epoch in seconds (e.g., 1751731294).
 * @property {string} ageDate - An ISO 8601 formatted date string derived from `ageEpoch` (e.g., "2025-07-05T16:01:34.000Z").
 *
 * @example
 * const isValid = await verifyArticleCount(articles, 50);
 * if (!isValid) {
 *   console.warn("Mismatch in article count. Review collection pipeline.");
 * }
 */
async function verifyArticleCount(articles, maximumArticles) {
  if (!articles || articles.length === 0) {
    console.error("No articles collected. Please check the collection logic.");
    return false;
  } else if (articles.length !== maximumArticles) {
    console.warn(`\x1b[33mWarning: Expected ${maximumArticles} articles, but collected ${articles.length}. Please check the collection logic.\x1b[0m`);
    return false;
  }
  return true;
}

module.exports = { 
  sortArticlesByAge, 
  verifySortedArticles, 
  verifyArticleCount 
};