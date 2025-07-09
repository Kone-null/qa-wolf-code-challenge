// @ts-check
const { test, expect } = require('@playwright/test');
const { hasArticlesOnPage} = require('../../utils/collect.js');

test.describe('hasArticlesOnPage', () => {
  test('returns true on a valid Hacker News "newest" page', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/newest', { waitUntil: "load" });
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