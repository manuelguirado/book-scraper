// This file is responsible for creating a browser instance using puppeteer
const puppeteer = require('puppeteer');
//init the browser
async function startbrowser() {
    //create a browser instance
    let browser;
    try{
        console.log("Opening the browser");
        browser = await puppeteer.launch({
            headless : false, //the browser is running in headless mode
            args :  ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });

    }catch(err){
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}
module.exports = {
    startbrowser
}
