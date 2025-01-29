const scraperObject = {
  url: "https://books.toscrape.com",
  async scrapper(browser) {
    let page;
    try {
      page = await browser.newPage();
      console.log(`Navigating to ${this.url}...`);
      await page.goto(this.url, { waitUntil: "networkidle2" });
    } catch (error) {
      console.error(`Failed to navigate: ${error.message}`);
      await browser.close();
      return;
    }

    let scrappedData = [];
    async function scrapeCurrentPage() {
      try {
        // Wait for the required DOM to be rendered
        await page.waitForSelector(".page_inner");
        // Get the link to all the required books
        let urls = await page.$$eval("section ol > li", (links) => {
          //make sure the book to be scrapped is in stock
          links = links.filter((link) =>
            link
              .querySelector(".instock.availability")
              .textContent.includes("In stock")
          );
          // Extract the links from the data
          links = links.map((el) => el.querySelector("h3 > a").href);
          return links;
        });

        // loop through each of those links, open a new page and get the relevant data from them
        let pagePromise = (link) =>
          new Promise(async (resolve, reject) => {
            let data = {};
            let newPage = await browser.newPage();
            try {
              await newPage.goto(link);
              data["bookTitle"] = await newPage.$eval(
                ".product_main > h1",
                (text) => text.textContent
              );
              data["bookPrice"] = await newPage.$eval(
                ".price_color",
                (text) => text.textContent
              );
              data["noAvailable"] = await newPage.$eval(
                ".instock.availability",
                (text) => {
                  //strip new line tab spaces
                  text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                  //get the number of stock available
                  let regexp = /^.*\((.*)\).*$/i;
                  let stockAvailable = text.match(regexp);
                  return stockAvailable ? stockAvailable[1] : null;
                }
              );
              data["imageUrl"] = await newPage.$eval(
                "#product_gallery img",
                (img) => img.src
              );
              data["bookDescription"] = await newPage.$eval(
                "#product_description",
                (div) => div?.nextSibling.nextSibling?.textContent
              );
              resolve(data);
            } catch (error) {
              console.error(`Failed to scrape data from ${link}: ${error.message}`);
              reject(error);
            } finally {
              await newPage.close();
            }
          });

        for (let link of urls) {
          let currentPageData = await pagePromise(link);
          scrappedData.push(currentPageData);
        }

        let nextPageExist = (await page.$(".next > a")) !== null;
        if (nextPageExist) {
          await Promise.all([
            page.click(".next > a"),
            page.waitForNavigation({ waitUntil: "networkidle0" }),
          ]);
          await scrapeCurrentPage(); // Recursively scrape the next page
        }
      } catch (error) {
        console.error(`Failed to scrape current page: ${error.message}`);
      }
    }

    await scrapeCurrentPage();
    return scrappedData;
  },
};

module.exports = scraperObject;
