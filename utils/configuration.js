/**
 * Configuration object for Hacker News scraper
 * @constant {Object} CONFIG
 * @property {number} MAX_ARTICLES - Maximum number of articles to scrape
 * @property {number} ARTICLES_PER_PAGE - Number of articles displayed per page
 * @property {string} BASE_URL - Base URL for Hacker News 'newest' page
 */
const CONFIG = {
  MAX_ARTICLES: 100, // Maximum number of articles to scrape
  ARTICLES_PER_PAGE: 30,
  DEFAULT_PAGINATION_DELAY: 3000, // Default delay for pagination in milliseconds
  BASE_URL: 'https://news.ycombinator.com/newest'
};


module.exports = { CONFIG };