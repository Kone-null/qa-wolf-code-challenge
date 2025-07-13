const { test, expect } = require('@playwright/test');
const {

  validateArticleSorting,
  verifyArticleCount,
} = require('../utils/sort-verify.js');

test.describe('validateArticleSorting', () => {
  test('returns true for correctly sorted articles', async () => {
    const articles = [
      { title: 'Newest', ageEpoch: 300 },
      { title: 'Middle', ageEpoch: 200 },
      { title: 'Oldest', ageEpoch: 100 },
    ];
    const result = await validateArticleSorting(articles);
    expect(result).toBe(true);
  });

  test('returns false for incorrectly sorted articles', async () => {
    const articles = [
      { title: 'Oldest', ageEpoch: 100 },
      { title: 'Newest', ageEpoch: 300 },
      { title: 'Middle', ageEpoch: 200 },
    ];
    const result = await validateArticleSorting(articles);
    expect(result).toBe(false);
  });
});

test.describe('verifyArticleCount', () => {
  test('returns true if articles length matches maximumArticles', async () => {
    const articles = Array.from({ length: 5 }, (_, i) => ({ title: `A${i}`, ageEpoch: i }));
    const result = await verifyArticleCount(articles, 5);
    expect(result).toBe(true);
  });

  test('returns false if articles is empty', async () => {
    const result = await verifyArticleCount([], 5);
    expect(result).toBe(false);
  });

  test('returns false if articles length does not match maximumArticles', async () => {
    const articles = Array.from({ length: 3 }, (_, i) => ({ title: `A${i}`, ageEpoch: i }));
    const result = await verifyArticleCount(articles, 5);
    expect(result).toBe(false);
  });
});