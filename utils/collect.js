// import { CONFIG } from "./configuration.mjs"; // Import the configuration
const { CONFIG } = require("./configuration.js"); // Import the configuration


/**
 * Collects Top 100 articles from Hacker News | Newest
 * @param {Page} page - Playwright page object
 * @returns {Promise<Array>} Array of article objects
 */
async function collect_article_published_date(page, link) {

  // Navigate to the article link
  await page.goto(link);

  // Wait for the article to load
  await page.waitForSelector("head meta"); // Adjust selector based on the actual page structure

  // Try to get the published date meta tag safely
  const publishedMeta = await page.$("head meta[name='article:published_time']");
  let publishDateString = null;
  if (publishedMeta) {
    publishDateString = await publishedMeta.getAttribute('content');
  }
  // You may want to parse publishDateString to epoch if needed
  return publishDateString;
}


/**
 * Collects articles from the current Page
 * @param {Page} page - Playwright page object
 * @param {number} articleLimit - Maximum number of articles to collect
 * @returns {Promise<Array>} Array of article objects
 */
async function collect_page_articles(page, articleLimit) {
  const articles = await page.$$eval(".athing", (items, articleLimit) => {
    // Convert NodeList to Array and slice it
    return Array.from(items).slice(0, articleLimit).map((item) => {
      const title = item.querySelector(".titleline > a").innerText;
      const link = item.querySelector(".titleline > a").href;
      const rank = item.querySelector(".rank").innerText;
      const ageEpoch = parseInt(item.nextElementSibling.querySelector(".age").getAttribute("title").split(" ")[1]);

      // convert age (epc) to local date time iso string
      const ageDate = new Date(ageEpoch * 1000);

      return { title, link, rank, ageEpoch, ageDate: ageDate.toISOString() };
    });
  }, articleLimit);

  return articles;


}




async function collect_top_100_articles(page) {
  const articles = [];

  // We don't need to start the loop unless we have articles to collect
  while (articles.length < CONFIG.MAX_ARTICLES) {
    // Calculate the current page's article limit
    let articleLimit = Math.min(CONFIG.ARTICLES_PER_PAGE, CONFIG.MAX_ARTICLES - articles.length);

    // Log details for debugging
    console.log(`Collecting articles from page: ${Math.floor(articles.length / CONFIG.ARTICLES_PER_PAGE) + 1}`);
    console.log(`Article limit for this page: ${articleLimit}`);

    // Wait for the page to load (adjust as needed for performance)
    // await page.waitForSelector('.athing',);  // Wait for articles to be visible


    // Handle the case where the page might not have any articles ("Sorry" Page)
    if (await page.$("pre") !== null) {
      const sorryText = await page.$eval("pre", el => el.innerText);
      if (sorryText.includes("Sorry")) {
        console.log("\x1b[31mNo articles found. Exiting collection.\x1b[0m");
        break;  // Exit the loop if no articles are found
      }
    }



    // Collect articles from the current page
    const newArticles = await collect_page_articles(page, articleLimit);
    articles.push(...newArticles);

    console.log(`Total articles collected: ${articles.length} of ${CONFIG.MAX_ARTICLES}`);

    // If we still need more articles, click on the "More" button
    // This check prevents unnecessary clicks if we've already collected enough
    if (articles.length < CONFIG.MAX_ARTICLES) {
      console.log("Clicking 'More' to load more articles...");
      try {
        await page.getByRole('link', { name: 'More', exact: true }).click();
      } catch (error) {
        console.log("No more articles to load or error occurred.");
        break;  // Stop the loop if no more articles can be loaded
      }
    }
  }

  // Ensure the collection stops exactly at 100 articles 
  return articles.slice(0, CONFIG.MAX_ARTICLES);
}

module.exports = { collect_top_100_articles, collect_page_articles };
