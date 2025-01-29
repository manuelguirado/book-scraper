const pageScrapper = require("./pageScrapper").default;
const fs = require("fs");

async function scrappeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = {};
    // Call the page controller one by one
    scrapedData["Travel"] = await pageScrapper.scrapper(browser, "Travel");
    scrapedData["Mystery"] = await pageScrapper.scrapper(browser, "Mystery");
    scrapedData["Historical Fiction"] = await pageScrapper.scrapper(
      browser,
      "Historical Fiction"
    );
    scrapedData["Sequential Art"] = await pageScrapper.scrapper(
      browser,
      "Sequential Art"
    );
    scrapedData["Classics"] = await pageScrapper.scrapper(browser, "Classics");
    await browser.close();
    fs.promises.writeFile(
      "data.json",
      JSON.stringify(scrapedData, null, 2),
      "utf8",
      (err) => {
        if (err) console.log(err);
        console.log("Data has been written to data.json");
      }
    );
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}
module.exports = (browserInstance) => scrappeAll(browserInstance);
