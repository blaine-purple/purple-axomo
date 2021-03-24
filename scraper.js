require('dotenv').config();
const NotificationCenter = require('node-notifier').NotificationCenter;
const puppeteer = require('puppeteer');
const { EMAIL, PASSWORD, TIME } = process.env;
const productUrls = require('./products.js')

let timer = parseFloat(TIME) || 15


var notifier = new NotificationCenter({
    withFallback: false, // Use Growl Fallback if <= 10.8
    customPath: undefined // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
});


async function scrapeProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    const fullUrl = 'https://purplesc.axomo.com/' + url;
    await page.goto(fullUrl);
    await page.type('#boxUserName', EMAIL);
    await page.type('#boxPassword', PASSWORD);
    await page.click('#btnLogin');

    await page.waitForSelector('h1');
    const [titleXPath] = await page.$x('//*[@id="axoItemTitle"]');
    const titleHtml = await titleXPath.getProperty('textContent');
    const title = await titleHtml.jsonValue();
    const parsedTitle = title.replace(/\n/g, '').trim();

    const [priceXPath] = await page.$x('//*[@id="axoItemPrice"]');
    const priceHtml = await priceXPath.getProperty('textContent');
    const price = await priceHtml.jsonValue();

    const [stockLevelXPath] = await page.$x('//*[@id="axoItemOptionsInner"]/h4');
    const stockLevelHtml = await stockLevelXPath.getProperty('textContent');
    const stockLevel = await stockLevelHtml.jsonValue();


    let productLineObj = { parsedTitle, price, stockLevel, fullUrl };
    browser.close();
    return productLineObj
};

function logProducts(products) {
    console.table(products)
    for (let i in products) {
        if (products[i].stockLevel != 'Out of Stock') {
            notifier.notify({
                title: `${products[i].parsedTitle} in stock!!!`,
                message: `${products[i].stockLevel}`,
                sound: "Ping",
                wait: true,
                open: products[i].fullUrl
            });
        }
    }
};


function getDateTime() {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

    return datetime
};

function loopingThroughProducts(urls) {
    let promises = []
    for (let i = 0; i < urls.length; i++) {
        promises.push(scrapeProduct(urls[i]));
    }
    Promise.all(promises)
        .then((res) => {
            logProducts(res);
            console.log(`finished ${getDateTime()}`)
        })
        .catch((err) => {
            console.log("something is wrong", err)
        })
}

notifier.notify({
    title: 'test notification',
    message: 'your axomo store notifications are working',
    sound: "Ping",
    timeout: 100,
    icon: "Terminal Icon",
    open: "https://purplesc.axomo.com/"
});

console.log(`\n\n\n\n\n\n\n\n\n\n\n\nstarted ${getDateTime()}\n`)
loopingThroughProducts(productUrls);

setInterval(function () {
    console.log(`waited ${timer} minutes.\n\n\n\n\n\n\n\n\n\n\n\nstarted ${getDateTime()}\n`)
    loopingThroughProducts(productUrls);
}, 60 * 1000 * timer);

