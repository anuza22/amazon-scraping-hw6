import { collectAllCategoryLinks, extractProductDetails } from './amazon.js';
import puppeteer from 'puppeteer';

export async function scrapeAmazonProducts(req, res) {
    const url = "https://www.amazon.com/b/?_encoding=UTF8&ie=UTF8&node=23466307011&pd_rd_w=pLKhT&content-id=amzn1.sym.f8d62906-a452-4f4d-b404-3d26f153fbdc&pf_rd_p=f8d62906-a452-4f4d-b404-3d26f153fbdc&pf_rd_r=XV77HJHZZS4TDAJD3F9W&pd_rd_wg=jjbNn&pd_rd_r=04925968-2785-43fa-b344-48668a7afcb0&ref_=pd_hp_d_hero_unk";
    
    let browser;
    let allProducts = []; 

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    try {
        browser = await puppeteer.launch({
            headless: true, 
            args: ['--no-sandbox'] 
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "load" });

        const categories = await collectAllCategoryLinks(page);
        console.log('Categories:', categories);

        for (const categoryLink of categories) {
            try {
                await page.goto(categoryLink, { waitUntil: "load" });
                await sleep(10000);
                const products = await extractProductDetails(page);
                console.log('Products in category:', categoryLink, products);
                allProducts = allProducts.concat(products); 
            } catch (error) {
                console.error('Error navigating to category or extracting product details:', error);
            }
        }

        res.status(200).json({ products: allProducts });

    } catch (error) {
        console.error('Error in scraping function:', error);
        res.status(500).send('Error scraping Amazon products');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}


scrapeAmazonProducts();