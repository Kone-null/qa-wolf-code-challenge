const { chromium } = require("playwright");
const { CONFIG } = require('./utils/configuration.js');// Import the configuration
const { getArticles } = require('./utils/collect.js'); // Import the collection function
const { sortArticlesByAge, verifySortedArticles, verifyArticleCount } = require('./utils/sort-verify.js'); // Import the sorting function


async function sortHackerNewsArticles() {

  const config = CONFIG;
  const browserType = chromium;
  const headless = CONFIG.HEADLESS;   // Set to false for debugging purposes.
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


  const accounted = await verifyArticleCount(articles, maxArticles);

  if (!accounted) {
    console.error(`missing 'articles' ${maxArticles - articles.length} of ${maxArticles}`);
    return false; // An error occurred that resulted in missing articles (NOT totaling to maxArticleLimit. Ex: 100).
  }


  const sortedArticles = await sortArticlesByAge(articles);

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
