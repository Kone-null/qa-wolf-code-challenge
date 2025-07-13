const { chromium } = require("playwright");
const { CONFIG } = require('./utils/config.js');// Import the configuration
const { getArticles } = require('./utils/collect.js'); // Import the collection function
const {
  validateArticleSorting,
  verifyArticleCount
} = require('./utils/sort-verify.js'); // Import the sorting function

const fs = require('fs/promises');
const path = require('path');




/**
 * Writes an array of articles to a JSON file, creating any missing directories.
 *
 * @async
 * @function saveArticlesToFile
 * @param {Article[]} articles - The list of articles to serialize.
 * @param {string} outputPath - Full filesystem path (including filename) for the JSON output.
 * @returns {Promise<void>} Resolves when the file has been successfully written.
 * @throws {Error} If writing to disk fails.
 *
 * @typedef {Object} Article
 * @property {string} title     - Article title (e.g. "The Velvet Sundown officially confirm they're AI").
 * @property {string} link      - Article URL (e.g. "https://...").
 * @property {string} rank      - Display rank (e.g. "2.").
 * @property {number} ageEpoch  - UNIX timestamp in seconds (e.g. 1751731294).
 * @property {string} ageDate   - ISO 8601 date string derived from `ageEpoch`.
 *
 * @example
 * const articles = [
 *   {
 *     title:   'Sample Article',
 *     link:    'https://example.com',
 *     rank:    '1.',
 *     ageEpoch: 1688475600,
 *     ageDate: '2023-07-04T12:00:00.000Z'
 *   }
 * ];
 *
 * await saveArticlesToFile(articles, './output/articles.json');
 */
async function saveArticlesToFile(articles, outPath) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(outPath);
    await fs.mkdir(dir, { recursive: true });

    // Serialize and write articles
    const payload = JSON.stringify(articles, null, 2);
    await fs.writeFile(outPath, payload, 'utf8');
    console.info(`\x1b[36m[INFO]\x1b[0m  [saveArticlesToFile]  Articles successfully written to ${outPath}`);
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [saveArticlesToFile]  Failed to write articles to ${outPath}:  ${err}`);

  }
}



/**
 * @name sortHackerNewsArticles
 * @async
 * @function
 *
 * Main workflow to scrape, validate, and persist meta data for Hacker News articles.
 *
 * This function:
 * - Uses configuration settings to launch a browser and collect articles.
 * - Saves the raw articles to JSON files.
 * - Verifies the article count against the configured maximum.
 * - Validates that articles are sorted from newest to oldest by `ageEpoch`.
 *
 * @requires CONFIG
 * @requires getArticles
 * @requires saveArticlesToFile
 * @requires verifyArticleCount
 * @requires validateArticleSorting
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

  const dataSaveDir = config.SAVE_PATH;



  // 1. Scrape
  const articles = await getArticles(
    browserType,
    headless,
    maxArticles,
    config.BASE_URL,
    config.ARTICLES_PER_PAGE,
    config.DEFAULT_PAGINATION_DELAY,
    config.USER_AGENTS,

  );

  // 2. Persist raw data
  const rawPath = path.join(dataSaveDir, "hacker_news_articles.json")
  await saveArticlesToFile(articles, rawPath);

  // 3. Verify count
  const accounted = await verifyArticleCount(articles, maxArticles);

  if (!accounted) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [sortHackerNewsArticles]  Expected ${maxArticles} articles but got ${articles.length}.`);
    return false;
  }

  // 4. Verify original order
  const isSortedCorrectly = await validateArticleSorting(articles);

  if (!isSortedCorrectly) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [sortHackerNewsArticles]  Articles are not properly sorted`)
  }
  return isSortedCorrectly;


}




(async () => {
  const isSorted = await sortHackerNewsArticles();
  console.log(
    `${isSorted ? '\x1b[32m' : '\x1b[31m'}Results indicate that the first ${CONFIG.MAX_ARTICLES} articles ${isSorted ? 'are' : 'are NOT'
    } sorted newest to oldest.\x1b[0m`
  );
})();
