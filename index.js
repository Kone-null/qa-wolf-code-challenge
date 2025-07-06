const { chromium } = require("playwright");
const { CONFIG } = require('./utils/config.js');// Import the configuration
const { getArticles } = require('./utils/collect.js'); // Import the collection function
const { sortArticlesByAge, verifySortedArticles, verifyArticleCount } = require('./utils/sort-verify.js'); // Import the sorting function
const fs = require('fs/promises');



/**
 * Saves an array of article objects to a JSON file.
 *
 * @async
 * @function saveArticlesToFile
 * @param {Article[]} articles - Array of article objects to write.
 * @param {string} outPath - Filesystem path (including filename) where the JSON file should be written.
 * @returns {Promise<void>} Resolves when the file has been successfully written.
 *
 * @typedef {Object} Article
 * @property {string} title - The article's title (e.g., "The Velvet Sundown officially confirm they're AI").
 * @property {string} link - The article's URL (e.g., "https://www.rollingstone.com/music/music-features/...").
 * @property {string} rank - The displayed rank of the article (e.g., "2.").
 * @property {number} ageEpoch - UNIX timestamp (in seconds) when the article was posted (e.g., 1751731294).
 * @property {string} ageDate - ISO 8601 date string derived from `ageEpoch` (e.g., "2025-07-05T16:01:34.000Z").
 *
 * @example
 * const articles = [
 *   {
 *     title: 'Sample Article',
 *     link: 'https://example.com',
 *     rank: '1.',
 *     ageEpoch: 1688475600,
 *     ageDate: '2023-07-04T12:00:00.000Z'
 *   }
 * ];
 * await saveArticlesToFile(articles, './output/articles.json');
 *
 * @throws {Error} If writing to `outPath` fails, logs the error to console.
 */

async function saveArticlesToFile(articles, outPath) {
  try {
    await fs.writeFile(outPath, JSON.stringify(articles, null, 2), 'utf8');
    console.log(`Articles written to ${outPath}`);
  } catch (err) {
    console.error(`\x1b[31mFailed to write articles to ${outPath}:\x1b[0m`, err);

  }
}


/**
 * @name sortHackerNewsArticles
 * @async
 * @function
 *
 * Main workflow to scrape, validate, sort, and persist Hacker News articles.
 *
 * This function:
 * - Uses configuration settings to launch a browser and collect articles.
 * - Saves the raw and sorted articles to JSON files.
 * - Verifies the article count against the configured maximum.
 * - Sorts articles by `ageEpoch` from newest to oldest.
 * - Verifies that the sorted list is correctly ordered.
 *
 * @requires CONFIG
 * @requires getArticles
 * @requires saveArticlesToFile
 * @requires verifyArticleCount
 * @requires sortArticlesByAge
 * @requires verifySortedArticles
 *
 * @returns {Promise<boolean>} Resolves to `true` if articles were successfully scraped, sorted, and verified; otherwise `false`.
 *
 * @example
 * const success = await sortHackerNewsArticles();
 * if (!success) {
 *   console.error("Failed to scrape and sort articles correctly.");
 * }
 */
async function sortHackerNewsArticles() {

  const config = CONFIG;
  const browserType = chromium;
  const headless = config.HEADLESS;  // Default: True.
  const maxArticles = config.MAX_ARTICLES;


  const articles = await getArticles(
    browserType,
    headless,
    maxArticles,
    config.BASE_URL,
    config.ARTICLES_PER_PAGE,
    config.DEFAULT_PAGINATION_DELAY,
    config.USER_AGENTS,

  );

  await saveArticlesToFile(articles, "ts_data/hacker_news_articles.json");
  const accounted = await verifyArticleCount(articles, maxArticles);

  if (!accounted) {
    const missingArticles = maxArticles - articles.length;
    console.error(`\x1b[31mMissing 'articles' ${missingArticles} of ${maxArticles}\x1b[0m`);

    return false; // An error occurred that resulted in missing articles (NOT totaling to maxArticleLimit. Ex: 100).
  }


  const sortedArticles = await sortArticlesByAge(articles);
  await saveArticlesToFile(sortedArticles, "ts_data/hacker_news_articles_sorted.json");

  const isSorted = await verifySortedArticles(sortedArticles);

  return isSorted;


}




(async () => {
  const isSorted = await sortHackerNewsArticles();
  console.info(`Results indicate that the first ${CONFIG.MAX_ARTICLES} articles are${isSorted ? '' : " NOT"} sorted newest to oldest.`);

})();
