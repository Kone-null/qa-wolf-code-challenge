# QA Wolf Coding Challenge: Hacker News Scraper

This repository contains a solution to the [QA Wolf Application Coding Challenge](CHALLENGE_README.md). The app uses Playwright to scrape the [Hacker News "newest" page](https://news.ycombinator.com/newest), collects articles, sorts them by age, and verifies that the first 100 articles are sorted from newest to oldest.

---

## Table of Contents

- [Features](#features)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Notes](#notes)

---

## Features

- Scrapes the newest articles from Hacker News using Playwright
- Collects a configurable number of articles (default: 100)
- Verifies the article count and order
- Automated tests using Playwright Test

---

## Dependencies

All dependencies are listed in [`package.json`](package.json):

- [playwright](https://www.npmjs.com/package/playwright) (`^1.39.0`) - For browser automation and scraping
- [@playwright/test](https://www.npmjs.com/package/@playwright/test) (`^1.39.0`) - For running automated tests
- [@types/node](https://www.npmjs.com/package/@types/node) (`^20.8.9`) - Node.js typings for development

Node.js version 16 or above is required.

---

## Configuration

Configuration is managed in [`utils/config.json`](utils/config.json):

```json
{
  "HEADLESS": true,
  "MAX_ARTICLES": 100,
  "ARTICLES_PER_PAGE": 30,
  "DEFAULT_PAGINATION_DELAY": 3000,
  "BASE_URL": "https://news.ycombinator.com/newest",
  "SAVE_PATH": "ts_data",
  "USER_AGENTS": [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) ...",
    "Mozilla/5.0 (X11; Linux x86_64) ...",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:55.0) ...",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) ..."
  ]
}
```

- **HEADLESS**: Run browser in headless mode (`true` for CI or production).
- **MAX_ARTICLES**: Number of articles to collect (default: 100).
- **ARTICLES_PER_PAGE**: Number of articles per page on HN (default: 30).
- **DEFAULT_PAGINATION_DELAY**: Delay in ms between page loads (default: 3000).
- **BASE_URL**: The Hacker News "newest" URL.
- **SAVE_PATH**: The directory to save collected article(s) meta data. Makes directory if not exists.
- **USER_AGENTS**: List of user agents for requests.

You can edit `utils/config.json` to change scraping and browser parameters.

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kone-null/qa-wolf-code-challenge.git
   cd qa-wolf-code-challenge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure the app:**  
   Edit `utils/config.json` to change scraping parameters (see above).

---

## Running the App

To run the main script and verify article order:

```bash
node index.js
```

The script will scrape the defined number of articles and report if they are sorted from newest to oldest.

---

## Testing

This project uses Playwright's built-in test runner.

- All tests are located in the [`tests/`](tests/) directory.
- Example test: [`tests/rate-limiting.spec.js`](tests/rate-limiting.spec.js)

To run all tests:

```bash
npx playwright test
```

- By default, tests will run in all supported browsers (Chromium, Firefox, WebKit) as configured in [`playwright.config.js`](playwright.config.js).
- To run a specific test file:
  ```bash
  npx playwright test tests/rate-limiting.spec.js
  ```
- Playwright will generate an HTML report after the tests, which you can view with:
  ```bash
  npx playwright show-report
  ```

---

## Project Structure

```
qa-wolf-code-challenge/
├── index.js                 # Main application entry point
├── CHALLENGE_README.md
├── README.md
├── package.json
├── package-lock.json
├── playwright.config.js     # Playwright test configuration
├── tests/                   # Playwright tests
│   ├── collection/
│   │   ├── get_article.test.js
│   │   ├── has_articles.test.js
│   │   ├── scrape.test.js
│   │   └── ua_select.test.js
│   ├── rate_limiting.spec.js
│   └── sort_verify.test.js
└── utils/
    ├── config.js            # Loads config JSON
    ├── config.json          # App configuration
    ├── collect.js           # Article collection logic
    └── sort-verify.js       # Sorting & verification functions
```

---

## Notes

- Made on Unix (intel MacOS).
- Ensure you are using Node.js 16 or above.
- All scraping and verification logic is in `index.js` and the `utils/` folder.
- You may need to update Playwright browsers for the first run with:
  ```bash
  npx playwright install
  ```
- For more details on Playwright, see the [Playwright documentation](https://playwright.dev/).

---

## Resources

- [View more files and search results in the repository](https://github.com/Kone-null/qa-wolf-code-challenge)
