const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { getArticles} = require('../../utils/collect.js');
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








