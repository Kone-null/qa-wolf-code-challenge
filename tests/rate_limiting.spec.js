// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { getArticles } = require('../utils/collect.js');
const { CONFIG } = require('../utils/config.js');


const HEADLESS = true;
const PG_DELAY = 3000; // Reduce delay for testing

test.describe('rate-limit testing with getArticles', () => {
  test('getArticles collects exactly 100 articles', async () => {
    const headless = HEADLESS;
    const maxArticles = 100; // Set the maximum articles to collect
    const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
    const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)

    const articles = await getArticles(
      chromium,
      headless, 
      maxArticles,
      CONFIG.BASE_URL,
      articlesPerPage,
      paginationDelay,
      CONFIG.USER_AGENTS,
    );
    expect(articles).toHaveLength(maxArticles);

  });


  test('getArticles collects exactly 200 articles', async () => {
    const headless = HEADLESS;
    const maxArticles = 200; // Set the maximum articles to collect
    const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
    const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)

    const articles = await getArticles(
      chromium,
      headless, 
      maxArticles,
      CONFIG.BASE_URL,
      articlesPerPage,
      paginationDelay,
      CONFIG.USER_AGENTS,
    );
    expect(articles).toHaveLength(maxArticles);

  });

  test('getArticles collects exactly 600 articles', async () => {
    test.setTimeout(60000);
    const headless = HEADLESS;
    const maxArticles = 600; // Set the maximum articles to collect
    const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
    const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)

    const articles = await getArticles(
      chromium,
      headless, 
      maxArticles,
      CONFIG.BASE_URL,
      articlesPerPage,
      paginationDelay,
      CONFIG.USER_AGENTS,
    );
    expect(articles).toHaveLength(maxArticles);

  });

  test('getArticles collects exactly 800 articles', async () => {
    const headless = HEADLESS;
    const maxArticles = 800; // Set the maximum articles to collect
    const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
    const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)


    const articles = await getArticles(
      chromium,
      headless, 
      maxArticles,
      CONFIG.BASE_URL,
      articlesPerPage,
      paginationDelay,
      CONFIG.USER_AGENTS,
    );
    expect(articles).toHaveLength(maxArticles);

  });

  test('getArticles collects exactly 1000 articles', async () => {
    const headless = HEADLESS;
    const maxArticles = 1000; // Set the maximum articles to collect
    const articlesPerPage = CONFIG.ARTICLES_PER_PAGE; // Use the configured articles per page
    const paginationDelay = PG_DELAY; // Reduce delay for testing (3000ms)


    const articles = await getArticles(
      chromium,
      headless, 
      maxArticles,
      CONFIG.BASE_URL,
      articlesPerPage,
      paginationDelay,
      CONFIG.USER_AGENTS,
    );
    expect(articles).toHaveLength(maxArticles);

  });

})






