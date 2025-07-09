// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { scrapePageArticles } = require('../../utils/collect.js'); // Import the function

test.describe('scrapePageArticles function', () => {
  let browser;
  let page;

  // Setup before each test
  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  // Cleanup after each test
  test.afterAll(async () => {
    await browser.close();
  });

  test('should scrape articles correctly', async () => {
    // Navigate to Hacker News Newest page
    await page.goto('https://news.ycombinator.com/newest');

    // Call scrapePageArticles to scrape the articles
    const articles = await scrapePageArticles(page, 5); // Limit to 5 articles for this test

    // Assert that the number of articles scraped is equal to the limit
    expect(articles.length).toBe(5);

    // Assert that each article has title, link, rank, and ageEpoch
    articles.forEach((article) => {
      expect(article.title).toBeTruthy(); // Title should be a non-empty string
      expect(article.link).toMatch(/^https?:\/\//); // Link should start with 'http' or 'https'
      expect(article.rank).toBeTruthy(); // Rank should not be empty
      expect(article.ageEpoch).toBeGreaterThan(0); // ageEpoch should be a positive number
    });
  });

  test('should handle non-numeric article limit gracefully', async () => {
    // Test with an invalid article limit (non-numeric string)
    const articles = await scrapePageArticles(page, 'invalidLimit');
    
    // If the limit is invalid, default to scraping 0 articles
    expect(articles.length).toBe(0);
  });

  test('should handle no articles gracefully', async () => {
    // Navigate to a page with no articles (e.g., an empty page or an error page)
    await page.goto('https://news.ycombinator.com/newest');
    const articles = await scrapePageArticles(page, 0); // Scrape no articles
    
    // Assert no articles are returned
    expect(articles.length).toBe(0);
  });

  test('should scrape more than 0 articles with valid page content', async () => {
    // Navigate to a known valid page with multiple articles
    await page.goto('https://news.ycombinator.com/newest');
    
    // Scrape first 5 articles
    const articles = await scrapePageArticles(page, 5);
    
    // Check that we received at least one article and the content is valid
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].title).toBeTruthy();
    expect(articles[0].link).toBeTruthy();
    expect(articles[0].rank).toBeTruthy();
    expect(articles[0].ageEpoch).toBeGreaterThan(0);
  });
});
