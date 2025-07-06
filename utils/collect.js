
/**
 * Checks whether a Playwright page contains articles by validating page structure and content.
 *
 * This function performs the following checks:
 * 1. Detects if the page is a block page (e.g., shows a "Sorry" message in a `<pre>` tag).
 * 2. Verifies the page title matches the expected "New Links | Hacker News".
 * 3. Confirms that at least one article element with class `.athing` exists on the page.
 *
 * @async
 * @function
 * @param {import('playwright').Page} page - The Playwright `Page` object to check for article content.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the page contains valid articles, otherwise `false`.
 *
 * @example
 * const pageHasArticles = await hasArticlesOnPage(page);
 * if (pageHasArticles) {
 *   console.log("Page contains articles!");
 * } else {
 *   console.log("No articles found or blocked page.");
 * }
 *
 * @throws Logs an error and returns `false` if an exception occurs during page evaluation.
 */
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
    console.error("\x1b[31mError in hasArticlesOnPage:\x1b[0m", error);
    return false;
  }
}

/**
 * Returns a random user agent string from the provided list, or a default user agent if the list is invalid or empty.
 *
 * @async
 * @function
 * @param {string[]} userAgents - An array of user agent strings to choose from.
 * @returns {Promise<string>} A randomly selected user agent string, or a default one if none are provided.
 *
 * @example
 * const agents = [
 *   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
 *   "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
 * ];
 * const userAgent = await randomUserAgent(agents);
 * console.log(userAgent); // Logs one of the provided agents, or the default if the array is empty
 */
async function randomUserAgent(userAgents) {

  const defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";

  if (!Array.isArray(userAgents) || userAgents.length === 0) {
    return defaultUA;

  }
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return randomUserAgent;
}

/**
 * Scrapes article data from a given Playwright page, extracting title, link, rank, and age for each article.
 *
 * @async
 * @function
 * @param {import('playwright').Page} page - A Playwright `Page` instance representing the browser page to scrape.
 * @param {number|string} articleLimit - The maximum number of articles to scrape. Can be a number or a string convertible to a number.
 * @returns {Promise<Object[]>} A promise that resolves to an array of article objects.
 *
 * Each article object has the following structure:
 * @typedef {Object} Article
 * @property {string} title - The title of the article.
 * @property {string} link - The URL of the article.
 * @property {string} rank - The ranking or position of the article on the page.
 * @property {number} ageEpoch - The article's age in epoch time (seconds since Unix epoch), if available.
 * @property {string} ageDate - ISO-formatted date string derived from the epoch, or empty string if not available.
 *
 * @example
 * const { chromium } = require("playwright");
 * const browser = await chromium.launch();
 * const page = await browser.newPage();
 * await page.goto('https://news.ycombinator.com/');
 * const articles = await scrapePageArticles(page, 10);
 * console.log(articles);
 * await browser.close();
 * 
 * @throws Logs an error to the console and returns an empty array if scraping fails.
 */
async function scrapePageArticles(page, articleLimit) {
  try {
    const limit = parseInt(articleLimit, 10) || 0; // test for non number
    const articles = await page.$$eval(".athing", (items, limit) => {
      return Array.from(items).slice(0, limit).map((item) => {
        const title = item.querySelector(".titleline > a")?.innerText || "";
        const link = item.querySelector(".titleline > a")?.href || "";
        const rank = item.querySelector(".rank")?.innerText || "";
        const ageElem = item.nextElementSibling?.querySelector(".age");

        let ageEpoch = 0;
        if (ageElem) {
          const titleAttr = ageElem.getAttribute("title");
          if (titleAttr) {
            const splitTitle = titleAttr.split(" ");
            const epochStr = splitTitle.length > 1 ? splitTitle[1] : null;
            if (epochStr && !isNaN(parseInt(epochStr, 10))) {
              ageEpoch = parseInt(epochStr);
            }
          }
        }
        let ageDate = "";
        if (ageEpoch !== 0) {
          ageDate = new Date(ageEpoch * 1000).toISOString();
        }
        return { title, link, rank, ageEpoch, ageDate };
      });
    }, limit);
    return articles;
  } catch (error) {
    console.error("\x1b[31mError in scrapePageArticles:\x1b[0m", error);
    return [];
  }
}



// /**
//  * Scrapes a list of articles from a Playwright page, retrieving each article's title, link, rank, and age (if available).
//  *
//  * @async
//  * @function scrapePageArticles
//  * @param {import('playwright').Page} page - The Playwright `Page` instance to scrape.
//  * @param {number|string} articleLimit - Maximum number of articles to scrape; accepts a number or a string that can be parsed to a number.
//  * @returns {Promise<Article[]>} A promise that resolves to an array of article objects.
//  *
//  * @typedef {Object} Article
//  * @property {string} title - The article's title text.
//  * @property {string} link - The URL of the article.
//  * @property {string} rank - The article's rank on the page (e.g., "1.", "2.").
//  * @property {number} ageEpoch - Unix epoch time representing when the article was posted, or 0 if unavailable.
//  * @property {string} ageDate - ISO 8601 formatted date string derived from the epoch, or an empty string if not found.
//  *
//  * @example
//  * const { chromium } = require("playwright");
//  * const browser = await chromium.launch();
//  * const page = await browser.newPage();
//  * await page.goto('https://news.ycombinator.com/');
//  * const articles = await scrapePageArticles(page, 10);
//  * console.log(articles);
//  * await browser.close();
//  *
//  * @throws Logs an error to the console and returns an empty array if scraping fails.
//  */
// async function scrapePageArticles(page, articleLimit) {
//   try {
//     const limit = parseInt(articleLimit, 10) || 0;
//     const articleElements = await page.$$(".athing");
//     const articles = [];

//     for (let i = 0; i < Math.min(limit, articleElements.length); i++) {
//       const item = articleElements[i];

//       const title = await item.$eval(".titleline > a", el => el.innerText).catch(() => "");
//       const link = await item.$eval(".titleline > a", el => el.href).catch(() => "");
//       const rank = await item.$eval(".rank", el => el.innerText).catch(() => "");

//       // Get the age element from the next sibling row
//       const nextRow = await item.evaluateHandle(el => el.nextElementSibling);
//       let ageEpoch = 0;
//       let ageDate = "";

//       if (nextRow) {
//         const ageElem = await nextRow.$(".age");
//         if (ageElem) {
//           const titleAttr = await ageElem.getAttribute("title");
//           if (titleAttr) {
//             const splitTitle = titleAttr.split(" ");
//             const epochStr = splitTitle.length > 1 ? splitTitle[1] : null;
//             if (epochStr && !isNaN(parseInt(epochStr, 10))) {
//               ageEpoch = parseInt(epochStr, 10);
//               ageDate = new Date(ageEpoch * 1000).toISOString();
//             }
//           }
//         }
//         await nextRow.dispose();
//       }

//       articles.push({ title, link, rank, ageEpoch, ageDate });
//     }

//     return articles;
//   } catch (error) {
//     console.error("\x1b[31mError in scrapePageArticles:\x1b[0m", error);
//     return [];
//   }
// }


/**
 * Collects articles from a paginated Playwright page by iteratively scraping pages until a maximum number is reached.
 *
 * The function:
 * - Checks if articles are present using `hasArticlesOnPage()`
 * - Scrapes a limited number of articles per page using `scrapePageArticles()`
 * - Waits between page navigations and handles retries on failed loads
 * - Clicks the "More" button to advance pagination
 *
 * @async
 * @function
 * @param {import('playwright').Page} page - A Playwright `Page` instance from which articles will be scraped.
 * @param {number} maximumArticles - Total number of articles to collect before stopping.
 * @param {number} articlesPerPage - Number of articles to attempt to collect per page.
 * @param {number} paginationDelay - Initial delay (in milliseconds) to wait between paginated requests.
 * @returns {Promise<Object[]>} A promise that resolves to an array of article objects collected across pages.
 *
 * Each article object typically has this shape:
 * @typedef {Object} Article
 * @property {string} title - The article title.
 * @property {string} link - The article URL.
 * @property {string} rank - The article rank as displayed.
 * @property {number} ageEpoch - The UNIX epoch timestamp (in seconds) when the article was posted.
 * @property {string} ageDate - An ISO 8601 formatted date string derived from `ageEpoch`.
 *
 * @example
 * const articles = await collectByPagination(page, 100, 30, 2000);
 * console.log(`Collected ${articles.length} articles.`);
 *
 * @throws Logs an error and exits the loop if:
 * - No articles are found after retries (possible block/ban)
 * - Scraping fails for a page
 * - Pagination navigation fails (e.g., no "More" button)
 */
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

          retry--;
          pageDelay *= 2;
          continue;
        }
        console.error("\x1b[31mCollection loop retry attempts maxed out. Exiting collection.\x1b[0m");
        break;
      }

      const currentPageArticles = await scrapePageArticles(page, pageArticleLimit);

      if (!currentPageArticles || currentPageArticles.length === 0) {
        // console.error("\x1b[31mNo Articles Scraped. Exiting Scraping.\x1b[0m", currentPageArticles, articles.length);

        return articles;

      }

      articles.push(...currentPageArticles);
      console.info(`collection progress: ${articles.length} of ${maximumArticles} articles.`);

      if (articles.length < maximumArticles) {
        // console.log(`\x1b[33m Wait for ${paginationDelay}ms before loading next page of articles.\x1b[0m`);
        await page.waitForLoadState('networkidle', { timeout: paginationDelay });
        try {
          // console.info("moving to next page by clicking 'More' action.");
          await page.getByRole('link', { name: 'More', exact: true }).click();
        } catch (error) {
          console.error("\x1b[31mNo more articles to load or error occurred.\x1b[0m", error);
          break;
        }
      }
    } catch (error) {
      console.error("\x1b[31mError in collectByPagination loop:\x1b[0m", error);
      break;
    }
  }
  return articles;
}


/**
 * Launches a browser, navigates to a Hacker News page, and collects a specified number of articles using pagination.
 *
 * This function handles:
 * - Launching a browser using the provided `browserType` (Chromium, Firefox, or WebKit)
 * - Configuring user agent and viewport
 * - Navigating to the target URL
 * - Optionally handling headless mode
 * - Collecting articles via `collectByPagination`
 * - Optionally handling user-agent rotation and rate-limit scenarios
 *
 * @async
 * @function
 * @param {import('playwright').BrowserType} browserType - The Playwright browser type (e.g., `chromium`, `firefox`, or `webkit`).
 * @param {boolean} headless - Whether to run the browser in headless mode.
 * @param {number} maximumArticles - Maximum number of articles to collect.
 * @param {string} hackerNewsURL - The URL of the Hacker News page to start scraping from.
 * @param {number} articlesPerPage - Number of articles to collect per page before paginating.
 * @param {number} paginationDelay - Delay (in milliseconds) between paginated requests.
 * @param {string[]} userAgents - An array of user-agent strings for rotation.
 * @returns {Promise<Object[]>} A promise that resolves to an array of article objects, up to the specified limit.
 *
 * @typedef {Object} Article
 * @property {string} title - The article title.
 * @property {string} link - The article URL.
 * @property {string} rank - The article's rank.
 * @property {number} ageEpoch - The UNIX epoch timestamp (in seconds).
 * @property {string} ageDate - ISO string representation of the article's posting date.
 *
 * @example
 * const { chromium } = require('playwright');
 * const articles = await getArticles(
 *   chromium,
 *   true,
 *   50,
 *   'https://news.ycombinator.com/newest',
 *   30,
 *   2000,
 *   ['Mozilla/5.0 ...', 'Mozilla/5.0 (Macintosh; Intel Mac OS X ...)']
 * );
 * console.log(articles.length); // Output: 50
 *
 * @throws Logs errors encountered during browser operation, page navigation, or scraping.
 * Always attempts to close the browser in the `finally` block.
 */
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

    // const userAgent = await page.evaluate(() => navigator.userAgent);
    // console.log("User Agent:", userAgent);

    // const pageTitle = await page.title();
    // console.log("Page Title:", pageTitle);

    const articles = await collectByPagination(page, maximumArticles, articlesPerPage, paginationDelay);
    return articles.slice(0, maximumArticles);

  } catch (error) {
    // console.error("Error in getArticles:", error);
    return [];

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("\x1b[31mError closing browser:\x1b[0m", closeError);

        return [];
      }
    }
  }
}

module.exports = {
  getArticles, scrapePageArticles,
  hasArticlesOnPage, randomUserAgent,
  collectByPagination,

};
