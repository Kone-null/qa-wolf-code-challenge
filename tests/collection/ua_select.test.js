const { test, expect } = require('@playwright/test');
const {randomUserAgent } = require('../../utils/collect.js');

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