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
  const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)
  // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(CONFIG.BASE_URL);

  const articles = await collectTopArticles(page, maxArticles, articlesPerPage, paginationDelay,);

  await browser.close();
  expect(articles).toHaveLength(maxArticles);

  
});



// test('collectTopArticles collects exactly 500 articles', async () => {

//   const maxArticles = 500; // Set the maximum articles to collect
//   const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
//   const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)
//   // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay

  
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);


//   const articles = await collectTopArticles(page, maxArticles, articlesPerPage, paginationDelay,);
  
//   await browser.close();
//   expect(articles).toHaveLength(maxArticles);

  

// });

// test('collectTopArticles collects exactly 1000 articles', async () => {

//   const maxArticles = 1000; // Set the maximum articles to collect
//   const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
//   const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)
//   // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay

  
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);


//   const articles = await collectTopArticles(page, maxArticles, articlesPerPage, paginationDelay,);
  
//   await browser.close();
//   expect(articles).toHaveLength(maxArticles);
// });

// test('collectTopArticles collects exactly 5000 articles', async () => {

//   const maxArticles = 5000; // Set the maximum articles to collect
//   const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
//   const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)
//   // const paginationDelay = CONFIG.DEFAULT_PAGINATION_DELAY; // Use the configured pagination delay

  
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(CONFIG.BASE_URL);


//   const articles = await collectTopArticles(page, maxArticles, articlesPerPage, paginationDelay,);
  
//   await browser.close();
//   expect(articles).toHaveLength(maxArticles);

// });