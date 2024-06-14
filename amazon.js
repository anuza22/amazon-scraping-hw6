
export async function extractCategoryLinks(page) {
    try {
        const categLinks = await page.evaluate(() => {
            const catLinks = Array.from(document.querySelectorAll('.a-container .a-row .bxc-grid-overlay__link'));
            return catLinks.map(el => el.href);
        });
        return categLinks;
    } catch (error) {
        console.error('Error extracting category links:', error);
        return [];
    }
}

export async function collectAllCategoryLinks(page, maxPages = 2) {
    let allLinks = [];
    let currentPage = 0;
    try {
        while (currentPage < maxPages) {
            const links = await extractCategoryLinks(page);
            allLinks.push(...links);

            const nextButton = await page.$('.pagination-next-button-selector'); 
            if (nextButton) {
                await Promise.all([
                    nextButton.click(),
                    page.waitForNavigation({ waitUntil: 'load' })
                ]);
                currentPage++;
            } else {
                break;
            }
        }
    } catch (error) {
        console.error('Error collecting all category links:', error);
    }
    return allLinks;
}

export async function extractProductDetails(page) {
    try {
        const products = await page.evaluate(() => {
            function getProductDetails(element) {
                const title = element.querySelector('h2.a-size-mini > a > span')?.innerText.trim() || 'N/A';
                const price = element.querySelector('span.a-price > span.a-offscreen')?.innerText.trim() || 'N/A';
                const rating = element.querySelector('span.a-icon-alt')?.innerText.trim() || 'N/A';
                
                return { title, price, rating };
            }

            const productElements = Array.from(document.querySelectorAll('.s-result-item')); 

            return productElements.map(getProductDetails);
        });

        return products;
    } catch (error) {
        console.error('Error extracting product details:', error);
        return [];
    }
}
