// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { collectTopArticles } = require('../utils/collect.js');
const { CONFIG } = require('../utils/configuration.js');

// index.test.js

const PG_DELAY = 3000; // Reduce delay for testing

test('collectTopArticles collects exactly 100 articles', async () => {

  const maxArticles = 100; // Set the maximum articles to collect
  const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
  const paginationDelay = PG_DELAY; // Reduce delay for testing
  // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(CONFIG.BASE_URL);

  // fixme: incomplete args for collectTopArticles
  const articles = await collectTopArticles(page, maxArticles, articlesPerPage, paginationDelay,);

  expect(articles).toHaveLength(maxArticles);

  await browser.close();
});

// test('collectTopArticles collects exactly 500 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 500;
//   CONFIG.DEFAULT_PAGINATION_DELAY = PG_DELAY; // Reduce delay for testing

//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);
//   // fixme: incomplete args for collectTopArticles
//   const articles = await collectTopArticles(page);

//   expect(articles).toHaveLength(500);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });

// test('collectTopArticles collects exactly 1000 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 1000;
//     CONFIG.DEFAULT_PAGINATION_DELAY = PG_DELAY; // Reduce delay for testing


//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);
//   // fixme: incomplete args for collectTopArticles
//   const articles = await collectTopArticles(page);

//   expect(articles).toHaveLength(1000);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });

// test('collectTopArticles collects exactly 5000 articles', async () => {
//   const originalMax = CONFIG.MAX_ARTICLES;
//   const originalDelay = CONFIG.DEFAULT_PAGINATION_DELAY;
//   CONFIG.MAX_ARTICLES = 5000;
//   CONFIG.DEFAULT_PAGINATION_DELAY = 3000; // Reduce delay for testing


//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);

//   // fixme: incomplete args for collectTopArticles
//   const articles = await collectTopArticles(page);

//   expect(articles).toHaveLength(5000);

//   await browser.close();
//   CONFIG.MAX_ARTICLES = originalMax;
// });