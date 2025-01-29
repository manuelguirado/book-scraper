const browserObject = require('./browser');
const pageController = require('./pagecontroller');
//start the browser and create a browser instance
let browserInstance = browserObject.startbrowser();
// pass the browser instace to the scraper controller
pageController(browserInstance);
