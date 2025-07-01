



async function sortArticlesByAge(articles) {
  // Sort articles by ageEpoch newest first.

  // Note: ageEpoch is in seconds, so we can sort directly.
  // Note: A larger epoch value means a newer article.

  return articles.sort((a, b) => b.ageEpoch - a.ageEpoch);


}


async function verifySortedArticles(articles) {
  // Verify Articles are sorted from newest to oldest.
  for (let i = 0; i < articles.length - 1; i++) {
    if (articles[i].ageEpoch < articles[i + 1].ageEpoch) {
      console.error(`Articles are not sorted correctly at index ${i}: ${articles[i].title} is older than ${articles[i + 1].title}`);
      return false;
    }
  }
  return true;
}

async function verifyArticleCount(articles, maximumArticles = 100) {
  if (!articles || articles.length === 0) {
    console.error("No articles collected. Please check the collection logic.");
    return false;
  } else if (articles.length !== maximumArticles) {
    console.warn(`\x1b[33mWarning: Expected ${maximumArticles} articles, but collected ${articles.length}. Please check the collection logic.\x1b[0m`);
    return false;
  }
  return true;
}

module.exports = { sortArticlesByAge, verifySortedArticles, verifyArticleCount };