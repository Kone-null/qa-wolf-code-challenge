const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { getArticles, hasArticlesOnPage, randomUserAgent } = require('../../utils/collect.js');
const { CONFIG } = require('../../utils/config.js');

test.describe('getArticles', () => {
  test('collects the expected number of articles', async () => {
    const maxArticles = 100; // Use a small number for a fast test
    const articles = await getArticles(
      chromium,
      true, // headless
      maxArticles,
      CONFIG.BASE_URL,
      CONFIG.ARTICLES_PER_PAGE,
      CONFIG.DEFAULT_PAGINATION_DELAY,
      CONFIG.USER_AGENTS
    );
    expect(Array.isArray(articles)).toBeTruthy();
    expect(articles.length).toBe(maxArticles);
    // Optionally, check structure of first article
    if (articles.length > 0) {
      expect(articles[0]).toHaveProperty('title');
      expect(articles[0]).toHaveProperty('link');
      expect(articles[0]).toHaveProperty('rank');
      expect(articles[0]).toHaveProperty('ageEpoch');
      expect(articles[0]).toHaveProperty('ageDate');
    }
  });
});



test.describe('hasArticlesOnPage', () => {
  test('returns true on a valid Hacker News "newest" page', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/newest');
    const result = await hasArticlesOnPage(page);
    expect(result).toBe(true);
  });

  test('returns false if "Sorry" block page is shown', async ({ page }) => {
    await page.setContent('<pre>Sorry.</pre>');
    const result = await hasArticlesOnPage(page);
    expect(result).toBe(false);
  });

  test('returns false if page title is not "New Links | Hacker News"', async ({ page }) => {
    await page.setContent('<title>Not Hacker News</title><div class="athing"></div>');
    // Playwright's setContent does not set the page title, so we use evaluate
    await page.evaluate(() => { document.title = "Not Hacker News"; });
    const result = await hasArticlesOnPage(page);
    expect(result).toBe(false);
  });

  test('returns false if no articles are present', async ({ page }) => {
    await page.setContent('<title>New Links | Hacker News</title>');
    await page.evaluate(() => { document.title = "New Links | Hacker News"; });
    const result = await hasArticlesOnPage(page);
    expect(result).toBe(false);
  });
});




test.describe('randomUserAgent', () => {
  test('returns a random user agent from the list', async () => {
    const agents = [
      'UA-1',
      'UA-2',
      'UA-3'
    ];
    const result = await randomUserAgent(agents);
    expect(agents).toContain(result);
  });

  test('returns default user agent if input is not an array', async () => {
    const defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
    const result = await randomUserAgent(null);
    expect(result).toBe(defaultUA);
  });

  test('returns default user agent if input array is empty', async () => {
    const defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
    const result = await randomUserAgent([]);
    expect(result).toBe(defaultUA);
  });
});