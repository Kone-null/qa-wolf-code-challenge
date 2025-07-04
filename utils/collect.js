async function hasArticlesOnPage(page) {
  try {
    // Check for "Sorry" block page
    const preTag = await page.$("pre");
    if (preTag !== null) {
      const sorryText = await page.$eval("pre", el => el.innerText);
      if (sorryText.includes("Sorry")) {
        return false;
      }
    }
    // Check for correct title
    const articlesPageTitle = "New Links | Hacker News";
    const pageTitle = await page.title();
    if (pageTitle !== articlesPageTitle) {
      return false;
    }
    // Check for at least one article
    return (await page.$('.athing')) !== null;
  } catch (error) {
    console.error("Error in hasArticlesOnPage:", error);
    return false;
  }
}


async function randomUserAgent(userAgents) {

  const defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";

  if (!Array.isArray(userAgents) || userAgents.length === 0) {
    return defaultUA;

  }
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return randomUserAgent;
}


async function scrapePageArticles(page, articleLimit) {
  try {
    const limit = parseInt(articleLimit, 10) || 0;
    const articleElements = await page.$$(".athing");
    const articles = [];

    for (let i = 0; i < Math.min(limit, articleElements.length); i++) {
      const item = articleElements[i];

      const title = await item.$eval(".titleline > a", el => el.innerText).catch(() => "");
      const link = await item.$eval(".titleline > a", el => el.href).catch(() => "");
      const rank = await item.$eval(".rank", el => el.innerText).catch(() => "");

      // Get the age element from the next sibling row
      const nextRow = await item.evaluateHandle(el => el.nextElementSibling);
      let ageEpoch = 0;
      let ageDate = "";

      if (nextRow) {
        const ageElem = await nextRow.$(".age");
        if (ageElem) {
          const titleAttr = await ageElem.getAttribute("title");
          if (titleAttr) {
            const splitTitle = titleAttr.split(" ");
            const epochStr = splitTitle.length > 1 ? splitTitle[1] : null;
            if (epochStr && !isNaN(parseInt(epochStr, 10))) {
              ageEpoch = parseInt(epochStr, 10);
              ageDate = new Date(ageEpoch * 1000).toISOString();
            }
          }
        }
        await nextRow.dispose();
      }

      articles.push({ title, link, rank, ageEpoch, ageDate });
    }

    return articles;
  } catch (error) {
    console.error("Error in scrapePageArticles:", error);
    return [];
  }
}


async function collectByPagination(page, maximumArticles, articlesPerPage, paginationDelay) {
  const articles = [];

  let retryAttempts = 10;
  let pageDelay = paginationDelay;

  while (articles.length < maximumArticles) {
    try {
      const remainingArticles = maximumArticles - articles.length;
      const pageArticleLimit = Math.min(articlesPerPage, remainingArticles);
      const currentPageNumber = Math.floor(articles.length / articlesPerPage) + 1;
      console.info(`current page (${currentPageNumber}) has limit set to ${pageArticleLimit} articles.`);

      if (!await hasArticlesOnPage(page)) {
        if (retryAttempts > 0) {
          await page.waitForLoadState('networkidle', { timeout: pageDelay });
          await page.reload({ waitUntil: "load" });
          console.info(`\x1b[31mAttempting retry ${retry} of 3\x1b[0m`);
          retry--;
          pageDelay *= 2;
          continue;
        }
        console.error("\x1b[31mNo articles found. Possible IP blacklist imposed. Exiting collection.\x1b[0m");
        break;
      }

      const currentPageArticles = await scrapePageArticles(page, pageArticleLimit);

      if (!currentPageArticles || currentPageArticles.length === 0) {
        console.error("No Articles Scraped. Exiting Scraping.", currentPageArticles, articles.length);
        return articles;

      }

      articles.push(...currentPageArticles);
      console.info(`collection progress: ${articles.length} of ${maximumArticles} articles.`);

      if (articles.length < maximumArticles) {
        console.log(`\x1b[33m Wait for ${paginationDelay}ms before loading next page of articles.\x1b[0m`);
        await page.waitForLoadState('networkidle', { timeout: paginationDelay });
        try {
          console.info("moving to next page by clicking 'More' action.");
          await page.getByRole('link', { name: 'More', exact: true }).click();
        } catch (error) {
          console.error("No more articles to load or error occurred.", error);
          break;
        }
      }
    } catch (error) {
      console.error("Error in collectByPagination loop:", error);
      break;
    }
  }
  return articles;
}

async function getArticles(browserType, headless, maximumArticles, hackerNewsURL, articlesPerPage, paginationDelay, userAgents) {

  let browser;
  try {
    const isHeadless = typeof headless === 'boolean' ? headless : true;
    browser = await browserType.launch({ headless: isHeadless });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: await randomUserAgent(userAgents),
    });
    const page = await context.newPage();

/*  ALT Solution to rate-limit handling & Prevention 
    let reloadAttempts = 0;
    const maxReloadAttempts = 10;
    let backoff = paginationDelay;
    let isReloading = false;

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('news.ycombinator.com/newest')) {
        if (response.status() === 200) {
          reloadAttempts = 0;
          backoff = paginationDelay;
          isReloading = false;
        }
        if (response.status() === 403 && reloadAttempts < maxReloadAttempts && !isReloading) {
          reloadAttempts++;
          isReloading = true;
          console.info(`403 Error Occurred: Reloading Page after Wait. Attempt ${reloadAttempts} of ${maxReloadAttempts}.`);
          await page.waitForTimeout(backoff);
          await page.reload({ waitUntil: "load" });
          backoff *= 2;
          isReloading = false;
        } else if (response.status() === 403 && reloadAttempts >= maxReloadAttempts) {
          console.error("Maximum reload attempts reached due to repeated 403 errors. Not reloading anymore.");
        }
      }
    });
*/


    await page.goto(hackerNewsURL, { waitUntil: "load" });

    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log("User Agent:", userAgent);

    const pageTitle = await page.title();
    console.log("Page Title:", pageTitle);

    const articles = await collectByPagination(page, maximumArticles, articlesPerPage, paginationDelay);
    return articles.slice(0, maximumArticles);

  } catch (error) {
    console.error("Error in getArticles:", error);
    return [];

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}

module.exports = {
  getArticles, scrapePageArticles,
  hasArticlesOnPage, randomUserAgent,
  collectByPagination,

};
