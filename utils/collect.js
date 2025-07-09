
/**
 * Determine if a Hacker News “new links” page contains articles.
 *
 * Checks:
 *  1. If a `<pre>` tag with “Sorry” exists → blocked.
 *  2. If the document title matches the expected title.
 *  3. If at least one article element (`.athing`) is present.
 *
 * @async
 * @function hasArticlesOnPage
 * @param {import('playwright').Page} page  – Playwright Page instance.
 * @returns {Promise<boolean>}  `true` if valid articles are found; otherwise `false`.
 */
export async function hasArticlesOnPage(page) {
  const EXPECTED_TITLE = 'New Links | Hacker News';
  try {

    // 1. Block detection via <pre> text.
    const preTag = page.locator('pre');
    const hasPre = await preTag.count() > 0;
    if (hasPre) {
      const text = await preTag.innerText({ timeout: 1000 }).catch(() => '');
      if (text.includes("Sorry")) {
        console.warn('\x1b[33m[WARN]\x1b[0m [hasArticlesOnPage] Blocked page detected (contains "Sorry").');
        return false;
      }

    }

    // 2. Title check.
    const actualTitle = await page.title();
    if (actualTitle !== EXPECTED_TITLE) {
      console.warn(`\x1b[33m[WARN]\x1b[0m  [hasArticlesOnPage] Unexpected page title: expected "${EXPECTED_TITLE}", got "${actualTitle}".`);
      return false;
    }

    // 3. Article elements check.
    const articleCount = await page.locator('.athing').count();
    if (articleCount === 0) {
      console.warn('\x1b[33m[WARN]\x1b[0m  [hasArticlesOnPage] No article elements (.athing) found on the page.');
      return false;
    }

    return true;

  } catch (error) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [hasArticlesOnPage]  Error in hasArticlesOnPage: ${err.message}`);
    return false;
  }
}

/**
 * Selects a random user agent string from a list, or returns a default if the list is invalid or empty.
 *
 * @async
 * @function randomUserAgent
 * @param {string[]} userAgents - An array of user agent strings to choose from.
 * @returns {Promise<string>} A randomly selected user agent string, or a default fallback.
 *
 * @example
 * const agents = [
 *   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
 *   "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
 * ];
 * const ua = await randomUserAgent(agents);
 * console.log(ua); // One of the provided agents, or the default if none are valid.
 */
export async function randomUserAgent(userAgents) {

  const DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/58.0.3029.110 Safari/537.3";

  if (!Array.isArray(userAgents) || userAgents.length === 0) {
    return DEFAULT_UA;

  }
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

/**
 * Scrapes article metadata from a Hacker News page using Playwright. 
 * 
 * Extracts:
 *  - Title and link
 *  - Rank position
 *  - Epoch time from article age tooltip
 *
 * @async
 * @function scrapePageArticles
 * @param {import('playwright').Page} page - A Playwright `Page` instance representing the page to scrape.
 * @param {number|string} articleLimit - Max number of articles to scrape. Can be numeric or numeric string.
 * @returns {Promise<Article[]>} Resolves with an array of article objects.
 *
 * Each article object has the following structure:
 * @typedef {Object} Article
 * @property {string} title     - Article title.
 * @property {string} link      - URL to the article.
 * @property {string} rank      - Rank/position (e.g. "1.", "2.").
 * @property {number} ageEpoch  - The article's age in epoch time (seconds since Unix epoch), if available.
 * @property {string} ageDate   - ISO 8601 string derived from the epoch, or empty string if not available.
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
 */
export async function scrapePageArticles(page, articleLimit) {
  try {
    const limit = Math.max(0, parseInt(articleLimit, 10) || 0);

    const articles = await page.$$eval(".athing", (items, limit) => {
      return Array.from(items).slice(0, limit).map((item) => {
        const anchor = item.querySelector('.titleline > a');
        const title = anchor?.innerText || '';
        const link = anchor?.href || '';
        const rank = item.querySelector('.rank')?.innerText || '';

        const ageElem = item.nextElementSibling?.querySelector('.age');
        let ageEpoch = 0;
        let ageDate = '';


        if (ageElem) {
          const titleAttr = ageElem.getAttribute("title");
          if (titleAttr) {
            ageEpoch = parseInt(titleAttr.split(" ")[1]) || 0;
          }
        }

        if (ageEpoch !== 0) {

          ageDate = new Date(ageEpoch * 1000).toISOString();
        }
        return { title, link, rank, ageEpoch, ageDate };
      });
    }, limit);
    return articles;
  } catch (error) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [scrapePageArticles] Error in scrapePageArticles: ${error}`);
    return [];
  }
}




/**
 * Iteratively collects articles across paginated Hacker News pages.
 *
 * @async
 * @function collectByPagination
 * @param {Page} page               – Playwright page to scrape.
 * @param {number} maxTotal         – Total number of articles to gather.
 * @param {number} perPageLimit     – Max articles to fetch per page.
 * @param {number} initialDelayMs   – Initial wait time (ms) between page loads.
 * @returns {Promise<Article[]>}    – Array of collected article objects.
 */
export async function collectByPagination(
  page,
  maxTotal,
  perPageLimit,
  initialDelayMs
) {
  const collected = [];
  let retries = 4;
  let delayMs = initialDelayMs;
  let pageIndex = 1;

  while (collected.length < maxTotal) {

    const remaining = maxTotal - collected.length;
    const pageLimit = Math.min(perPageLimit, remaining);
    console.info(`\x1b[36m[INFO]\x1b[0m  [collectByPagination] Page ${pageIndex}: fetching up to ${pageLimit} articles`); 

    // Ensure page is valid
    if (!(await hasArticlesOnPage(page))) {
      if (retries-- > 0) {
        console.warn(`\x1b[33m[WARN]\x1b[0m  [collectByPagination] Page blocked or invalid. Retrying after ${delayMs}ms...`);
        await page.waitForTimeout(delayMs);
        delayMs *= 2;
        await page.reload({ waitUntil: 'networkidle' });
        continue;
      }
      console.error('\x1b[31m[ERROR]\x1b[0m  [collectByPagination]  Max retries reached. Aborting pagination.');
      break;
    }

    const articles = await scrapePageArticles(page, pageLimit);

    if (articles.length === 0) {
      console.warn('\x1b[33m[WARN]\x1b[0m  [collectByPagination] No articles found on this page. Stopping.'); 
      break;
    }

    collected.push(...articles);
    console.info(`\x1b[36m[INFO]\x1b[0m  [collectByPagination] Collected ${collected.length}/${maxTotal} articles so far.`);
    // Prepare next page if needed.
    if (collected.length < maxTotal) {
      await page.waitForLoadState('networkidle', { timeout: initialDelayMs });
      try {
        await page.getByRole('link', { name: 'More', exact: true }).click();
        pageIndex++;
      } catch {
        console.warn('\x1b[33m[WARN]\x1b[0m  [collectByPagination] No "More" button found. Ending pagination.');
        break;
      }
    }

  }
  return collected;
}


/**
 * Launches a browser, navigates to Hacker News, and paginates to collect articles.
 *
 * @async
 * @function getArticles
 * @param {BrowserType} browserType       – Playwright browser (chromium, firefox, webkit).
 * @param {boolean}     headless          – Run in headless mode if true.
 * @param {number}      maxArticles       – Total articles to collect.
 * @param {string}      startUrl          – Hacker News URL to begin scraping.
 * @param {number}      perPageLimit      – Articles per page before clicking “More”.
 * @param {number}      paginationDelayMs – Delay (ms) between page navigations.
 * @param {string[]}    userAgents        – List of UAs for rotation.
 * @returns {Promise<Article[]>} Up to `maxArticles` scraped articles, or empty on error.
 *
 * @typedef {Object} Article
 * @property {string} title      – Article title.
 * @property {string} link       – Article URL.
 * @property {string} rank       – Displayed rank (e.g. "1.").
 * @property {number} ageEpoch   – UNIX timestamp (seconds).
 * @property {string} ageDate    – ISO 8601 date string.
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
 */
export async function getArticles(
  browserType,
  headless,
  maxArticles,
  startUrl,
  perPageLimit,
  paginationDelayMs,
  userAgents
) {
  let browser;
  try {

    // 1. Launch and configure browser.
    browser = await browserType.launch({ headless: Boolean(headless) });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: await randomUserAgent(userAgents),
    });
    const page = await context.newPage();


    // 2. Navigate to start URL.
    await page.goto(startUrl, { waitUntil: "load" });

    // 3. Collect via pagination.
    const allArticles = await collectByPagination(
      page,
      maxArticles,
      perPageLimit,
      paginationDelayMs
    );

    // 4. Slice to exactly maxArticles (in case pagination over-collected).
    return allArticles.slice(0, maxArticles);

  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m  [getArticles]  Error: ${err}`);
    return [];
  } finally {
    // 5. Ensure browser closes.
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error(`\x1b[31m[ERROR]\x1b[0m  [getArticles]  Error closing browser: ${closeErr}`);
      }
    }
  }
}


