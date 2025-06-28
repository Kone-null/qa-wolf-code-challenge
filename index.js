const { chromium } = require("playwright");
const { CONFIG } = require('./utils/configuration.js');// Import the configuration
const { collectTopArticles } = require('./utils/collect.js'); // Import the collection function
const { sortHackerNewsArticlesByAge, verifySortedArticles, verifyArticleCount } = require('./utils/sort-verify.js'); // Import the sorting function

const fs = require("fs"); // Remove before submission, only used for debugging

/*
DOCSTRING HERE
*/
async function randomUserAgent(userAgents) {
  // NOTE: Add throw exception for null useragent arg
  
  // Pick a random user agent
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  return randomUserAgent;
}


async function collectHackerNewsArticles(
  maximumArticles = CONFIG.MAX_ARTICLES,
  articlesPerPage = CONFIG.ARTICLES_PER_PAGE,
  paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY,
  baseURL = CONFIG.BASE_URL,
  userAgents = CONFIG.USER_AGENTS,
  headless = true // Set to false for debugging purposes
) {

  // Create and Establish a browser instance
  const browser = await chromium.launch({ headless: headless }); // Set headless to false for debugging

  // Create a new browser context with a random user agent
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: await randomUserAgent(userAgents),
  });

  // Create a new page in the context
  const page = await context.newPage();

  // Go to Hacker News homepage
  await page.goto(baseURL);

  // [DEBUG] Log the user agent for verification
  const userAgent = await page.evaluate(() => navigator.userAgent);
  console.log("User Agent:", userAgent);

  // Collect page title for verification
  const pageTitle = await page.title();
  console.log("Page Title:", pageTitle);

  // collect top given articles using "collectTopArticles" function
  const articles = await collectTopArticles(page, maximumArticles, articlesPerPage, paginationDelay);

  await browser.close(); // Close the browser after collection


  // Verify the articles are sorted by age (newest first) as listed on Hacker News
  const sortedArticles = await sortHackerNewsArticlesByAge(articles);
  if (!verifySortedArticles(sortedArticles)) {
    console.error("Articles (listed) are not sorted newest to oldest.");
    await browser.close();
    return;
  }


  // [DEBUG] Write the articles to a JSON file for debugging purposes
  fs.writeFileSync("ts_data/hacker_news_articles.json", JSON.stringify(articles, null, 2));
  console.log("Articles saved to hacker_news_articles.json");
  // [DEBUG]  Write the sorted articles to a JSON file
  fs.writeFileSync("ts_data/hacker_news_articles_sorted.json", JSON.stringify(sortedArticles, null, 2));
  console.log("Sorted articles saved to hacker_news_articles_sorted.json");

  // Return the articles
  return sortedArticles;

}





async function main() {

  // let articles;
  /*  
    collect top given articles from Hacker News
    -> create browser instance
    -> establish browser context
    -> create page instance
    -> go to Hacker News homepage
    -> collect page title for verification
    -> collect top x articles using "collectTopArticles" function
    -> sort and verify the articles are sorted by age (newest first) as list on Hacker News (not article pub-date)
    -> [DEBUG] write the articles to a JSON file for debugging purposes
    -> return the articles
  
  */

  // articles = await c100HackerNewsArticles();

  /* 
    if (articles.length !== CONFIG.MAX_ARTICLES)
    -> wait 30-60 seconds and collect articles again
    else: 
    -> continue with sorting and verification

  */

  let articles = []; // Initialize articles array
  try {// upgrade to async/await for better readability and error handling


    // Collect top (x) articles from Hacker News
    articles = await collectHackerNewsArticles();

    // Retry logic: if verifyArticleCount returns false, wait 60 seconds and try again
    while (!await verifyArticleCount(articles = articles, maximumArticles = CONFIG.MAX_ARTICLES)) {
      console.log("Retrying article collection in 60 seconds...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      articles = await collectHackerNewsArticles();
    }


  } catch (error) {
    console.error("An error occurred in the main function:", error);
  }

  console.log(`Total articles collected ${articles.length} of ${CONFIG.MAX_ARTICLES}`);


  /*
    collect listed articles published/ modified date

    split articles into even groups based on total articles and CONFIG.MAX_ARTICLES

    collect articles in parallel using Promise.all
    -> make sure to handle errors in each promise
    -> make sure the body tag is blocked to avoid loading unnecessary content

    verify all articles have a valid published date (epoch and ISO string) present in the article object
    -> if not, wait 30 seconds and collect with Promise.all again
    -> if all valid, continue with sorting and verification and
         return updated articles
  
  */

  /* 
    Sort Update Articles by list Article Pub-date age (newest first)
    
     verify sorted articles by
     -> comparing sorted article by rank and age as listed on hacker news newest page
      Note: the original articles are already sorted by rank and age (newest),
      -> so we can use that to verify the sorting

    if sorted updated articles are sorted correctly, matching how the articles are listed on Hacker News,
    -> Then return TRUE to validate that the EXTRACTED articles are indeed sorted from newest to oldest
    -> else, return FALSE to indicate that the sorting is incorrect and needs to be fixed
  
  */



}








(async () => {
  await main();
})();
