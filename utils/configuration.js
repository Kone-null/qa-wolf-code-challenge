
const CONFIG = {
  HEADLESS: false,
  MAX_ARTICLES: 100, // Maximum number of articles to scrape (default is 100).
  ARTICLES_PER_PAGE: 30, // Number of articles displayed per page (default is 30).
  DEFAULT_PAGINATION_DELAY: 3000, // Default delay for pagination in milliseconds (default is 3000ms).
  BASE_URL: 'https://news.ycombinator.com/newest', // Base URL for Hacker News 'newest' page (default is 'https://news.ycombinator.com/newest').
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0'
  ], // Array of user agents to use for the browser context.
};



module.exports = {CONFIG};