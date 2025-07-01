
async function isValidPage(page) {

  const preTag = await page.$("pre");
  // Handle the case where the page might not have any articles ("Sorry" Page)
  if (preTag !== null) {
    const sorryText = await page.$eval("pre", el => el.innerText);
    if (sorryText.includes("Sorry")) {
      // console.log("\x1b[31mNo articles found. Exiting collection.\x1b[0m");
      return false;  // Exit the loop if no articles are found

    }
  }

  return true;

}


async function randomUserAgent(userAgents) {
  // NOTE: Add throw exception for null useragent arg.

  // Pick a random user agent.
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  return randomUserAgent;
}


async function scrapePageArticles(page, articleLimit) {
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



async function getArticles(browserType, headless, maximumArticles, hackerNewsURL, articlesPerPage, paginationDelay, userAgents) {

  // This will be populated with article during collection.
  const articles = [];


  // console.log("Headless option:", headless);
  // Ensure headless is a boolean.
  const isHeadless = typeof headless === 'boolean' ? headless : true; // default to true if not a boolean.


  // Create and Establish a browser instance.
  const browser = await browserType.launch({ headless: isHeadless });
  // Create a new browser context with a random user agent.
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: await randomUserAgent(userAgents),
  });

  // Create a new page in the context.
  const page = await context.newPage();

  // Go to Hacker News homepage.
  await page.goto(hackerNewsURL, { waitUntil: "load" });

  // [DEBUG] Log the user agent for verification.
  const userAgent = await page.evaluate(() => navigator.userAgent);
  console.log("User Agent:", userAgent);

  // [DEBUG] Collect page title for verification.
  const pageTitle = await page.title();
  console.log("Page Title:", pageTitle);

  // Start collection of articles via pagination given collection limitations.
  // We don't need to start the loop unless we have articles to collect.
  while (articles.length < maximumArticles) {

    // Calculate the current page's article limit and current page number.
    let currentArticleLimit = Math.min(articlesPerPage, maximumArticles - articles.length);
    let currentPage = Math.floor(articles.length / articlesPerPage) + 1;

    console.info(`current page (${currentPage}) has limit set to ${currentArticleLimit} articles.`);


    // Validate page for rate-limit "Sorry" page.
    if (!await isValidPage(page)) {
      console.log("\x1b[31mNo articles found. Exiting collection.\x1b[0m");
      break; // Exit the loop if no articles are found. - Can leave article count incomplete.
    }
    // collect a given limited number of article meta data.
    const currentPageArticles = await scrapePageArticles(page, currentArticleLimit);

    // Incorporate collected article data to articles (sum) for processing.
    articles.push(...currentPageArticles);


    console.info(`collection progress: ${articles.length} of ${maximumArticles} articles.`);

    // If we still need more articles, click on the "More" button.
    // This check prevents unnecessary clicks if we've already collected enough.
    if (articles.length < maximumArticles) {
      // Wait for specified delay to prevent breaking rate limitations.
      console.log(`\x1b[33mHang for ${paginationDelay}ms before loading next page of articles.\x1b[0m`); // [DEBUGGING]

      await page.waitForTimeout(paginationDelay);

      try {
        console.info("moving to next page by clicking 'More' action.");
        await page.getByRole('link', { name: 'More', exact: true }).click();

      } catch (error) {
        console.error("No more articles to load or error occurred.", error);
        break;
      }

    }


  }
  await browser.close();
  // Ensure the collection stops exactly at set maximum article limit.
  return articles.slice(0, maximumArticles);

}



module.exports = { getArticles };
