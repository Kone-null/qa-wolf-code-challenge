const { chromium } = require("playwright");
const { CONFIG } = require('./utils/configuration.js');// Import the configuration
const { collect_top_100_articles } = require('./utils/collect.js'); // Import the collection function
const { sortHackerNewsArticlesByAge, verifySortedArticles } = require('./utils/sort-verify.js'); // Import the sorting function

const fs = require("fs"); // Remove before submission, only used for debugging




// async function
async function sortHackerNewsArticles() {

  try {
    // launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",


    });
    const page = await context.newPage();

    // go to Hacker News
    await page.goto(CONFIG.BASE_URL);

    // // wait for the page to load
    // await page.waitForSelector("")

    // get the page title
    const pageTitle = await page.title();
    console.log(pageTitle);

    // collect top 100 articles
    const articles = await collect_top_100_articles(page);

    console.log("Total articles collected (Final):", articles.length);

    if (articles.length !== CONFIG.MAX_ARTICLES) {
      console.warn(`\x1b[31mWarning: Expected ${CONFIG.MAX_ARTICLES} articles, but collected ${articles.length}. Please check the collection logic.\x1b[0m`);
      // await browser.close();
    }

    // console.log(articles);

    if (!verifySortedArticles(articles)) {
      console.error("Articles are not sorted correctly. Please check the sorting logic.");
      await browser.close();
    }

    // write the articles to a JSON file

    fs.writeFileSync("ts_data/hacker_news_articles.json", JSON.stringify(articles, null, 2));
    console.log("Articles saved to hacker_news_articles.json");


    // sort articles by age
    const sortedArticles = await sortHackerNewsArticlesByAge(articles);
    // console.log("Articles sorted by age (newest first):", sortedArticles);

    if (!verifySortedArticles(sortedArticles)) {
      console.error("sortedArticles are not sorted correctly. Please check the sorting logic.");
      await browser.close();
    }
    // write the sorted articles to a JSON file
    fs.writeFileSync("ts_data/hacker_news_articles_sorted.json", JSON.stringify(sortedArticles, null, 2));
    console.log("Sorted articles saved to hacker_news_articles_sorted.json");

    await browser.close();

  } catch (error) {// Review Playwright documentation for error handling
    console.error("An error occurred while collecting articles:", error);
    throw error; // Re-throw the error to ensure it is caught in the outer try-catch
  }


}





// async function sortHackerNewsArticlesByAge(articles) {
//   // Sort articles by ageEpoch newest first

//   // Note: ageEpoch is in seconds, so we can sort directly.
//   // Note: A larger epoch value means a newer article.

//   return articles.sort((a, b) => b.ageEpoch - a.ageEpoch);


// }







(async () => {
  await sortHackerNewsArticles();
})();
