// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { getArticles } = require('../utils/collect.js');
const { CONFIG } = require('../utils/config.js');

/* [NOTES TO SELF]
  Run collection tests for 100, 500, 1000, and 5000 articles.
  - Tests run concurrently in Chromium, Firefox, and Webkit.

  NOTE: Tests case which collect 500, 1000, and 5000 have a high probability - 
  -> of failure ,as a result of a network issue (too many concurrent page requests).

  Test Flakes

  DEV-NOTE: RUN TEST ON SINGLE BROWSER (CHROMIUM) TO PREVENT MASS NETWORK REQUESTS.
  [REMOVE DEV-NOTE IN FINAL VERSION]
*/

const PG_DELAY = 3000; // Reduce delay for testing

test('getArticles collects exactly 100 articles', async () => {
  const headless = false;
  const maxArticles = 100; // Set the maximum articles to collect
  const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
  const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)
  // // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay


  const articles = await getArticles(
    chromium,
    headless, // Set to false for debugging purposes
    maxArticles,
    CONFIG.BASE_URL,
    articlesPerPage,
    paginationDelay,
    CONFIG.USER_AGENTS,
  );
  expect(articles).toHaveLength(maxArticles);

});
