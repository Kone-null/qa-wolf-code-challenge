
async function hasArticlesOnPage(page) {

  const preTag = await page.$("pre");
  // Handle the case where the page might not have any articles ("Sorry" Page)
  if (preTag !== null) {
    const sorryText = await page.$eval("pre", el => el.innerText);
    if (sorryText.includes("Sorry")) {
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


async function collectByPagination(page, maximumArticles, articlesPerPage, paginationDelay) {

  // This will be populated with article during collection.
  const articles = [];

  // Start collection of articles via pagination given collection limitations.
  // We don't need to start the loop unless we have articles to collect.
  let retry = 3;
  while (articles.length < maximumArticles ) {

    // Calculate how many more articles can be fetched for the current page
    const remainingArticles = maximumArticles - articles.length;
    const articlesThisPage = Math.min(articlesPerPage, remainingArticles);

    // Determine the current page number (1-based)
    const currentPageNumber = Math.floor(articles.length / articlesPerPage) + 1;

    console.info(`current page (${currentPageNumber}) has limit set to ${articlesThisPage} articles.`);

    // Validates page for rate-limit "Sorry" page.
    if (!await hasArticlesOnPage(page)) {
      
      if (retry>0){
        
        await page.waitForLoadState('networkidle', { timeout: paginationDelay });
        await page.reload({ waitUntil: "load" });
        console.info(`\x1b[31mAttempting retry ${retry} of 3\x1b[0m`);
        retry--;
        continue; 
      }
      console.error("\x1b[31mNo articles found. Possible IP blacklist imposed. Exiting collection.\x1b[0m");
      break;  // Exit loop if no articles are found (Can leave article count incomplete).
    }
    // collect a given limited number of article meta data.
    const currentPageArticles = await scrapePageArticles(page, articlesThisPage);

    // Incorporate collected article data to articles (sum) for processing.
    articles.push(...currentPageArticles);


    console.info(`collection progress: ${articles.length} of ${maximumArticles} articles.`);

    // If we still need more articles, click on the "More" button.
    // This check prevents unnecessary clicks if we've already collected enough.
    if (articles.length < maximumArticles) {
      // Wait for specified delay to prevent breaking rate limitations.
      console.log(`\x1b[33m Wait for ${paginationDelay}ms before loading next page of articles.\x1b[0m`); // [DEBUGGING]

      // await page.waitForTimeout(paginationDelay);
      await page.waitForLoadState('networkidle', { timeout: paginationDelay });


      try {
        console.info("moving to next page by clicking 'More' action.");
        await page.getByRole('link', { name: 'More', exact: true }).click();

      } catch (error) {
        console.error("No more articles to load or error occurred.", error);
        break;
      }

    }


  }

  return articles;
}


async function getArticles(browserType, headless, maximumArticles, hackerNewsURL, articlesPerPage, paginationDelay, userAgents) {




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

  const articles = await collectByPagination(page, maximumArticles, articlesPerPage, paginationDelay);

  await browser.close();
  // Ensure the collection stops exactly at set maximum article limit.
  return articles.slice(0, maximumArticles);

}



module.exports = { getArticles };
