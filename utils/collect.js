


async function collectPageArticles(page, articleLimit) {
  const articles = await page.$$eval(".athing", (items, articleLimit) => {
    // Convert NodeList to Array and slice it
    return Array.from(items).slice(0, articleLimit).map((item) => {
      const title = item.querySelector(".titleline > a").innerText;
      const link = item.querySelector(".titleline > a").href;
      const rank = item.querySelector(".rank").innerText;
      const ageEpoch = parseInt(item.nextElementSibling.querySelector(".age").getAttribute("title").split(" ")[1]);

      // convert age (epc) to local date time iso string
      const ageDate = new Date(ageEpoch * 1000);

      return { title, link, rank, ageEpoch, ageDate: ageDate.toISOString() };
    });
  }, articleLimit);

  return articles;


}




// async function collectTopArticles(page, maximumArticles = 100, articlesPerPage = 30, paginationDelay = 3000) {
async function collectTopArticles(page, maximumArticles, articlesPerPage, paginationDelay) {
  const articles = [];


  // We don't need to start the loop unless we have articles to collect
  while (articles.length < maximumArticles) {

    // Calculate the current page's article limit and current page number
    let articleLimit = Math.min(articlesPerPage, maximumArticles - articles.length);
    let currentPage = Math.floor(articles.length / articlesPerPage) + 1

    // Log details for debugging
    console.log(`Article limit for page ${currentPage} is  ${articleLimit} articles.`);

    // Wait for the page to load (adjust as needed for performance)
    // await page.waitForSelector('.athing',);  // Wait for articles to be visible


    // Handle the case where the page might not have any articles ("Sorry" Page)
    if (await page.$("pre") !== null) {
      const sorryText = await page.$eval("pre", el => el.innerText);
      if (sorryText.includes("Sorry")) {
        // console.log("\x1b[31mNo articles found. Exiting collection.\x1b[0m");
        break;  // Exit the loop if no articles are found

      }
    }



    // Collect articles from the current page
    const newArticles = await collectPageArticles(page, articleLimit);
    articles.push(...newArticles);

    console.log(`Total articles collected: ${articles.length} of ${maximumArticles}`);

    // If we still need more articles, click on the "More" button
    // This check prevents unnecessary clicks if we've already collected enough
    if (articles.length < maximumArticles) {
      // Wait for the specified delay before clicking "More"
      console.log(`\x1b[33mWaiting for ${paginationDelay}ms before clicking 'More'...\x1b[0m`);
      await page.waitForTimeout(paginationDelay); // Adjust timeout as needed for performance

      try {

        console.log("Clicking 'More' to load more articles...");
        await page.getByRole('link', { name: 'More', exact: true }).click();


      } catch (error) {
        console.log("No more articles to load or error occurred.");
        break;  // Stop the loop if no more articles can be loaded
      }
    }
  }

  // Ensure the collection stops exactly at 100 articles 
  return articles.slice(0, maximumArticles);
}



// async function collectHackerNewsArticles() {




// }


module.exports = { collectTopArticles };
