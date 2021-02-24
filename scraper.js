require('dotenv').config();
const notifier = require('node-notifier');
const fs = require('fs');
const puppeteer = require('puppeteer');
const xlsx = require('xlsx');
const { EMAIL, PASSWORD } = process.env;
var productsList = [['Product Name', 'Price', 'Stock Levels', 'URL']];
var productListObj = [];

const path = './axomo-store-inventory.xlsx';

async function removeFiles(path) {
    await fs.unlink(path, (err) => {
        if (err && err.errno != -2) {
            console.error(err);
            return
        }
    });
}

// removeFiles(path);

async function scrapeProduct(url) {
    if (url) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
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
    
        let productLine = [parsedTitle, price, stockLevel, fullUrl];
        let productLineObj = {parsedTitle, price, stockLevel, fullUrl};
        productsList.push(productLine);
        productListObj.push(productLineObj)
        browser.close();
    }
}

// scrape function to pull each of the category urls dynamically but haven't pulled each product within each page (this is probably not what we want in this case since it is a heavy call each time)
// async function scrapeProductsDynamically(url) {
//     const browser = await puppeteer.launch({ headless: false, devtools: true });
//     const page = await browser.newPage();
//     await page.goto(url);
//     await page.type('#boxUserName', EMAIL);
//     await page.type('#boxPassword', PASSWORD);
//     await page.click('#btnLogin');

//     await page.waitForSelector('.block-grid-item')
//     const links = await page.$$eval('.block-grid-item a', allLinks => allLinks.map(link => link.href));
//     const aoaLinks = links.map(link => [link]);

//     //eventually needs to loop through each page's products however this can be heavy since it will not offer a way for a user to choose any products.

//     const book = xlsx.utils.book_new();
//     const sheet = xlsx.utils.aoa_to_sheet(aoaLinks);
//     xlsx.utils.book_append_sheet(book, sheet);
//     xlsx.writeFile(book, 'links.xlsx');
// }

// scrapeProductsDynamically('https://purplesc.axomo.com/'); 

function createExcelBoook(products) {
    const book = xlsx.utils.book_new();
    const sheet = xlsx.utils.aoa_to_sheet(products);
    xlsx.utils.book_append_sheet(book, sheet);
    xlsx.writeFile(book, 'axomo-store-inventory.xlsx');
}

function logProducts(products) {
    console.table(products)
    for (let i in productsList) {
        if(productsList[i][2] !== 'Out of Stock'){
            notifier.notify({
                title: `${productsList[i][0]} in stock!!!`,
                message: `${productsList[i][2]}`
              });
        }
    }
};
function resetLists() {
    productsList = [['Product Name', 'Price', 'Stock Levels', 'URL']];
    productListObj = [];
}

let productUrls = [
    'item/2-purple-3-queen-mattress-sc', //Hybrid Premier 3 - Full
    'item/2-purple-4-queen-mattress-sc', //Hybrid Premier 4 - Full
    'item/purple-4-queen-mattress-sc', //Hybrid Premier 4 - Queen
    'item/purple-4-king-mattress-sc', //Hybrid Premier 4 - King
    'item/purple-pillow-sc', //Purple Pillow
    'item/3-harmony-pillow-scratch-and-dent', //Harmony Pillow - Standard 6.5"
    'item/2-king-size-plush-pillow', //Harmony Pillow - Standard 6.5"
    'item/ultimate-purple-cushion-sc', //Ultimate 1 

    //Mattresses
        // 'item/twin-nog-mattress', //Kid Mattress - Twin

        // 'item/2-original-twin-xl-mattress-sc', //Purple Mattress - Twin
        // 'item/3-original-twin-xl-mattress-sc', //Purple Mattress - Twin XL
        // 'item/2-original-full-mattress-sc', //Purple Mattress - Full 
        // 'item/2-original-queen-mattress-sc', //Purple Mattress - Queen
        // 'item/original-king-mattress-sc', //Purple Mattress - King
        // 'item/2-original-cal-king-mattress-sc', //Purple Mattress - Cal King

        // 'item/purple-2-twin-xl-mattress-sc', //Hybrid - Twin XL
        // 'item/purple-2-full-mattress-sc', //Hybrid - Full
        // 'item/purple-2-queen-mattress-sc', //Hybrid - Queen
        // 'item/purple-2-king-mattress-sc', //Hybrid - King
        // 'item/purple-2-cal-king-mattress-sc', //Hybrid - Cal King

        // 'item/2-purple-3-twin-xl-mattress-sc', //Hybrid Premier 3 - Twin XL
        // 'item/2-purple-3-queen-mattress-sc', //Hybrid Premier 3 - Full
        // 'item/purple-3-queen-mattress-sc', //Hybrid Premier 3 - Queen
        // 'item/purple-3-king-mattress-sc', //Hybrid Premier 3 - King
        // 'item/purple-3-cal-king-mattress-sc', //Hybrid Premier 3 - Cal King

        // 'item/purple-4-twin-xl-mattress-sc', //Hybrid Premier 4 - Twin XL
        // 'item/2-purple-4-queen-mattress-sc', //Hybrid Premier 4 - Full
        // 'item/purple-4-queen-mattress-sc', //Hybrid Premier 4 - Queen
        // 'item/purple-4-king-mattress-sc', //Hybrid Premier 4 - King
        // 'item/purple-4-cal-king-mattress-sc', //Hybrid Premier 4 - Cal King

    //Pet Beds
        // 'item/2-back-purple-cushion-sc', // Large Pet Bed
        // 'item/pet-bed-large-sc', // Medium Pet Bed
        // 'item/pet-bed-medium-sc', // Small Pet Bed

    //Mattress Protectors
        // 'item/twin-mattress-protector-sc', //Mattress Protector - Twin
        // 'item/twin-xl-mattress-protector-sc', //Mattress Protector - Twin XL
        // 'item/full-mattress-protector-sc', //Mattress Protector - Full
        // 'item/full-xl-mattress-protector-sc', //Mattress Protector - Full XL
        // 'item/queen-mattress-protector-sc', //Mattress Protector - Queen
        // 'item/king-mattress-protector-sc', //Mattress Protector - King
        // 'item/cal-king-mattress-protector-sc', //Mattress Protector - Cal King

        // 'item/deep-pocket-twin-xl-mattress-protector-sc', //Mattress Protector - Twin (Deep Pocket)
        // 'item/deep-pocket-full-mattress-protector-sc', //Mattress Protector - Twin XL (Deep Pocket)
        // 'item/deep-pocket-queen-mattress-protector-sc', //Mattress Protector - Full (Deep Pocket)
        // 'item/deep-pocket-cal-king-mattress-protector-sc', //Mattress Protector - Queen (Deep Pocket)
        // 'item/2-king-mattress-protector-sc', //Mattress Protector - King (Deep Pocket)
        // 'item/deep-pocket-king-mattress-protector-sc', //Mattress Protector - Cal King (Deep Pocket)

    //Pillows
        // 'item/purple-pillow-sc', //Purple Pillow

        // 'item/3-wondergel-zest-flat-pillow-sc', //Plush Pillow - Standard 
        // 'item/king-size-plush-pillow', //Plush Pillow - King

        // 'item/3-harmony-pillow-scratch-and-dent', //Harmony Pillow - Standard 6.5"
        // 'item/2-king-size-plush-pillow', //Harmony Pillow - Standard 6.5"
        // 'item/plush-pillow', //Harmony Pillow - Tall 7.5"
        // 'item/tall-harmony-pillow-scratch-and-dent', //Harmony Pillow - Tall 7.5" (VITA)
        // 'item/2-tall-harmony-pillow-scratch-and-dent', //Harmony Pillow - Tall 7.5" (Retail)

        // 'item/2-harmony-pillow-scratch-and-dent', //Kid Pillow - White
        // 'item/kid-pillow-white-scratch-and-dent', //Kid Pillow - Blue
        // 'item/kid-pillow-blue-scratch-and-dent', //Kid Pillow - Pink
        // 'item/kid-pillow-pink-scratch-and-dent', //Kid Pillow - Grey

        // 'item/king-pillowcase-morning-mist', //SS Pillowcase - King - Morning Mist
        // 'item/king-pillowcase-natural-oat', //SS Pillowcase - King - Natural Oat
        // 'item/king-pillowcase-stormy-grey', //SS Pillowcase - King - Stormy Grey
        // 'item/king-pillowcase-true-white', //SS Pillowcase - King - True White
        // 'item/king-pillowcase-deep-purple', //SS Pillowcase - King - Deep Purple
        // 'item/king-pillowcase-soft-lilac', //SS Pillowcase - King - Soft Lilac

        // 'item/standard-pillowcase-morning-mist', //SS Pillowcase - Standard - Morning Mist
        // 'item/standard-pillowcase-natural-oat', //SS Pillowcase - Standard - Natural Oat
        // 'item/standard-pillowcase-stormy-grey', //SS Pillowcase - Standard - Stormy Grey
        // 'item/standard-pillowcase-true-white', //SS Pillowcase - Standard - True White
        // 'item/standard-pillowcase-deep-purple', //SS Pillowcase - Standard - Deep Purple
        // 'item/standard-pillowcase-soft-lilac', //SS Pillowcase - Standard - Soft Lilac

    //Duvet
        // 'item/gravity-weighted-blanket', //Duvet - Lightweight - Twin XL
        // 'item/twin-xl-lightweight-duvet', //Duvet - All Season - Twin XL
        // 'item/twin-xl-all-season-duvet', //Duvet - Lightweight - Queen
        // 'item/queen-lightweight-duvet', //Duvet - All Season - Queen
        // 'item/queen-all-season-duvet', //Duvet - Lightweight - King
        // 'item/king-lightweight-duvet', //Duvet - All Season - King

    //Weighted Blanket
        // 'item/2-wondergel-zest-flat-pillow-sc', //Weighted Blanket

    //Weighted Sleep Mask    
        // 'item/2-wondergel-zest-contour-pillow-sc', //Weighted Sleep Mask

    //Bed Frames
        // 'item/twin-xl-platform-base-sc', //Platform Bed - Twin 
        // 'item/twin-xl-metal-platform-base-sc', //Platform Bed - Twin XL 
        // 'item/2-twin-xl-platform-base-sc', //Platform Bed - Full 
        // 'item/queen-platform-base-sc', //Platform Bed - Queen 
        // 'item/king-platform-base-sc', //Platform Bed - King 
        // 'item/cal-king-platform-base-sc', //Platform Bed - Cal King 

        // 'item/twin-xl-foundation-platform-charcoal', //Foundation - Stone Twin
        // 'item/2-twin-xl-foundation-platform-charcoal', //Foundation - Stone Twin XL
        // 'item/full-foundation-platform-charcoal', //Foundation - Stone Full
        // 'item/king-foundation-platform-charcoal', //Foundation - Stone Queen
        // 'item/king-metal-platform-base-sc', //Foundation - Stone King
        // 'item/cal-king-foundation-platform-charcoal', //Foundation - Stone Cal King

        // 'item/twin-foundation-platform-grey', //Foundation - Charcoal Twin
        // 'item/3-king-foundation-platform-charcoal', //Foundation - Charcoal Twin XL
        // 'item/2-king-foundation-platform-charcoal', //Foundation - Charcoal Full
        // 'item/king-foundation-platform-charcoal', //Foundation - Charcoal Queen
        // 'item/king-foundation-platform-grey', //Foundation - Charcoal King
        // 'item/2-queen-foundation-platform-charcoal', //Foundation - Charcoal Cal King

        // 'item/queen-powerbase-sc', //PowerBase - Queen 
        // 'item/twin-xl-powerbase-sc', //PowerBase - Twin XL 
        // 'item/queen-premier-powerbase-sc', //PowerBase - Queen Limited Edition 

    //Seat Cushions
        // 'item/simply-purple-cushion-sc', //Simply 1
        // 'item/everywhere-purple-cushion-sc', //Everywhere/Foldaway 1
        // 'item/portable-purple-cushion-sc', //Portable 1
        // 'item/back-purple-cushion-sc', //Back 1
        // 'item/royal-purple-cushion-sc', //Royal 1
        // 'item/ultimate-purple-cushion-sc', //Ultimate 1 
        // 'item/double-purple-cushion-sc', //Double 1
        // 'item/2-double-purple-cushion-sc', //Wondergel
        // 'item/back-purple-cushion-dtc-sc', //Back 2
        // 'item/everywhere-purple-cushion-retail-sc', //Everywhere/Foldaway 2
        // 'item/portable-purple-cushion-dtc-sc', //Portable 2
        // 'item/royal-purple-cushion-retail-sc', //Royal 2
        // 'item/simply-purple-cushion-retail-sc', //Simply 2
        // 'item/3-back-purple-cushion-sc', //Lite

    //Sheets
        // 'item/purple-sheets-twin-twin-xl-purple-sc', //Sheets - Twin/Twin XL - Purple
        // 'item/purple-sheets-full-queen-purple-sc', //Sheets - Full/Queen - Purple
        // 'item/purple-sheets-king-cal-king-purple-sc', //Sheets - King/Cal King - Purple
        // 'item/purple-sheets-split-king-cal-king-white-sc', //Sheets - Split King - Purple

        // 'item/purple-sheets-twin-twin-xl-sand-sc', //Sheets - Twin/Twin XL - Sand
        // 'item/purple-sheets-full-queen-sand-sc', //Sheets - Full/Queen - Sand
        // 'item/purple-sheets-king-cal-king-sand-sc', //Sheets - King/Cal King - Sand
        // 'item/purple-sheets-split-king-cal-king-slate-sc', //Sheets - Split King - Sand

        // 'item/purple-sheets-twin-twin-xl-slate-sc', //Sheets - Twin/Twin XL - Slate
        // 'item/purple-sheets-full-queen-slate-sc', //Sheets - Full/Queen - Slate
        // 'item/purple-sheets-king-cal-king-slate-sc', //Sheets - King/Cal King - Slate
        // 'item/2-purple-sheets-king-cal-king-slate-sc', //Sheets - Split King - Slate

        // 'item/purple-sheets-twin-twin-xl-white-sc', //Sheets - Twin/Twin XL - White
        // 'item/purple-sheets-full-queen-white-sc', //Sheets - Full/Queen - White
        // 'item/purple-sheets-king-cal-king-white-sc', //Sheets - King/Cal King - White
        // 'item/2-purple-sheets-split-king-cal-king-white-sc', //Sheets - Split King - White

        // 'item/soft-stretch-full-morning-mist', //SS Sheets - Twin/Twin XL - Morning Mist
        // 'item/2-soft-stretch-queen-morning-mist', //SS Sheets - Full - Morning Mist
        // 'item/soft-stretch-queen-deep-purple', //SS Sheets - Queen - Morning Mist
        // 'item/2-softstretch-king-cal-king-stormy-grey', //SS Sheets - King/Cal King - Morning Mist
        // 'item/2-soft-stretch-full-morning-mist', //SS Sheets - Split King - Morning Mist

        // 'item/3-softstretch-king-cal-king-morning-mist', //SS Sheets - Twin/Twin XL - Natural Oat
        // 'item/soft-stretch-queen-true-white', //SS Sheets - Full - Natural Oat
        // 'item/soft-stretch-full-natural-oat', //SS Sheets - Queen - Natural Oat
        // 'item/2-soft-stretch-full-natural-oat', //SS Sheets - King/Cal King - Natural Oat
        // 'item/2-soft-stretch-queen-natural-oat', //SS Sheets - Split King - Natural Oat

        // 'item/softstretch-king-cal-king-deep-purple', //SS Sheets - Twin/Twin XL - True White
        // 'item/soft-stretch-queen-soft-lilac', //SS Sheets - Full - True White
        // 'item/soft-stretch-full-true-white', //SS Sheets - Queen - True White
        // 'item/2-soft-stretch-full-true-white', //SS Sheets - King/Cal King - True White
        // 'item/soft-stretch-king-cal-king-true-white', //SS Sheets - Split King - True White

        // 'item/2-soft-stretch-full-soft-lilac', //SS Sheets - Twin/Twin XL - Soft Lilac
        // 'item/softstretch-king-cal-king-deep-purple', //SS Sheets - Full - Soft Lilac
        // 'item/soft-stretch-full-soft-lilac', //SS Sheets - Queen - Soft Lilac
        // 'item/softstretch-king-cal-king-deep-purple', //SS Sheets - King/Cal King - Soft Lilac
        // 'item/soft-stretch-king-cal-king-soft-lilac', //SS Sheets - Split King - Soft Lilac

        // 'item/soft-stretch-full-stormy-grey', //SS Sheets - Twin/Twin XL - Stormy Grey
        // 'item/soft-stretch-queen-morning-mist', //SS Sheets - Full - Stormy Grey
        // 'item/soft-stretch-full-true-white', //SS Sheets - Queen - Stormy Grey
        // 'item/softstretch-king-cal-king-stormy-grey', //SS Sheets - King/Cal King - Stormy Grey
        // 'item/soft-stretch-king-cal-king-stormy-grey', //SS Sheets - Split King - Stormy Grey

        // 'item/soft-stretch-full-deep-purple', //SS Sheets - Twin/Twin XL - Deep Purple
        // 'item/2-soft-stretch-queen-morning-mist', //SS Sheets - Full - Deep Purple
        // 'item/soft-stretch-queen-natural-oat', //SS Sheets - Queen - Deep Purple
        // 'item/2-softstretch-king-cal-king-morning-mist', //SS Sheets - King/Cal King - Deep Purple
        // 'item/2-soft-stretch-full-deep-purple', //SS Sheets - Split King - Deep Purple
];

async function loopingThroughProducts(urls) {
    for (let i = 0; i < urls.length; i++) {
        await scrapeProduct(urls[i]);
    }
    // await createExcelBoook(productsList);
    await logProducts(productListObj);
}

notifier.notify({
    title: 'test notification',
    message: 'your axomo store notifications are working'
  });

loopingThroughProducts(productUrls);
setInterval(function() {
    resetLists()
    console.log("\n\n\n\n\n\n\n\n\n\n\n\nstarted...\n")
    loopingThroughProducts(productUrls); 
}, 60 * 1000 * 2);