// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { collect_top_100_articles } = require('../utils/collect.js');
const { CONFIG } = require('../utils/configuration.js');

// index.test.js

const PG_DELAY = 3000; // Reduce delay for testing

test('collect_top_100_articles collects exactly 100 articles', async () => {
  const originalMax = CONFIG.MAX_ARTICLES;
  const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
  CONFIG.MAX_ARTICLES = 100;
  CONFIG.DEFAULT_PAGINATION_DELAY = PG_DELAY; // Reduce delay for testing


  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(CONFIG.BASE_URL);

  const articles = await collect_top_100_articles(page);

  expect(articles).toHaveLength(100);

  await browser.close();
  CONFIG.MAX_ARTICLES = originalMax;
  CONFIG.DEFAULT_PAGINATION_DELAY = originalDelay;
});

// test('collect_top_100_articles collects exactly 500 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 500;
//   CONFIG.DEFAULT_PAGINATION_DELAY = PG_DELAY; // Reduce delay for testing

//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);

//   const articles = await collect_top_100_articles(page);

//   expect(articles).toHaveLength(500);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });

// test('collect_top_100_articles collects exactly 1000 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 1000;
//     CONFIG.DEFAULT_PAGINATION_DELAY = PG_DELAY; // Reduce delay for testing


//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);

//   const articles = await collect_top_100_articles(page);

//   expect(articles).toHaveLength(1000);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });

// test('collect_top_100_articles collects exactly 5000 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 5000;
//   CONFIG.DEFAULT_PAGINATION_DELAY = 3000; // Reduce delay for testing


//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);

//   const articles = await collect_top_100_articles(page);

//   expect(articles).toHaveLength(5000);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });