const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class CityAlkoScraper extends Scraper {
    constructor() {
        super("CityAlko");
        this.baseUrl = "https://cityalko.ee";
        this.categoryPages = [
            {url: "https://cityalko.ee/tootekategooria/kange-alkohol/?products-per-page=all", category: "strong"}
        ];

        super.priceRegex = /([\d,.]*\s€)/;
    }

    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        rp(category.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const $products = $(".clearfix.products").find(".instock");
                console.log($products.length);
                let products = [];

                $products.each((index, value) => {

                    const $meta = $(value).find(".product-meta");
                    const name = $meta.find("h3[class='product-name'] > a").text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: false,
                        originalName: name,
                        store: this.storeName,
                        url: $(value).find("a[class='woocommerce-LoopProduct-link woocommerce-loop-product__link']").attr("href"),
                        price: this.getPrice($(value).find("span[class='woocommerce-Price-amount amount']").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: $meta.find(".product-brand > a").last().text(),
                        imageUrl: $(value).find("a[class='thumb'] > span > img").attr("src")
                    };

                    if (product.ml === null) return;
                    products.push(product);
                    console.log(product)
                });
                callback(products);
            })
            .catch((err) => {
                console.error(err);
            });

    }
}

module.exports = CityAlkoScraper;