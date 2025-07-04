const { chromium } = require("playwright");
const { CONFIG } = require('./utils/config.js');// Import the configuration
const { getArticles } = require('./utils/collect.js'); // Import the collection function
const { sortArticlesByAge, verifySortedArticles, verifyArticleCount } = require('./utils/sort-verify.js'); // Import the sorting function
const fs = require('fs').promises;


async function write_articles(articles, outPath) {
  try {
    await fs.writeFile(outPath, JSON.stringify(articles, null, 2), 'utf8');
    console.log(`Articles written to ${outPath}`);
  } catch (err) {
    console.error(`Failed to write articles to ${outPath}:`, err);
  }
}

async function sortHackerNewsArticles() {

  const config = CONFIG;
  const browserType = chromium;
  const headless = CONFIG.HEADLESS;  // Default: True.
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

  await write_articles(articles,"ts_data/hacker_news_articles.json");
  const accounted = await verifyArticleCount(articles, maxArticles);

  if (!accounted) {
    console.error(`missing 'articles' ${maxArticles - articles.length} of ${maxArticles}`);
    return false; // An error occurred that resulted in missing articles (NOT totaling to maxArticleLimit. Ex: 100).
  }


  const sortedArticles = await sortArticlesByAge(articles);
  await write_articles(sortedArticles,"ts_data/hacker_news_articles_sorted.json");

  if (!await verifySortedArticles(sortedArticles)) {
    console.error(`'articles' after sorting don't match order of 'sortedArticles'`)

    return false; // Articles collected are NOT sorted newest to oldest.
  }


  return true; // Articles collected are sorted newest to oldest.


}




(async () => {
  const isSorted = await sortHackerNewsArticles();
  console.info(`Results indicate that the first ${CONFIG.MAX_ARTICLES} articles are${isSorted ? '' : " NOT"} sorted newest to oldest.`);

})();
