class Scraper {
    constructor(storeName, storeCountry) {
        this.storeName = storeName;
        this.storeCounty = storeCountry;
        this.volRegex = /[\D]((\d[\d.,]*)[%])/;
        this.mlRegex = /[\D]((\d+)(\s?[mM][lL]|[mM][lL]?))/;
        this.clRegex = /[\D]((\d[\d,.]*)\s?[cC][lL])/;
        this.lRegex = /[\D]((\d[\d,.]*)\s?[lL])/;
        this.priceRegex = /€([\d,.]*)/;
        this.illegalWords = [
            /^muu p\.j\./, /^muu piir\.jook/, /^muu p\.jook/, /^muu piiritusjook/, /^muu alk\.jk\./,
            /^m\.alkohoolne jook/, /^karp/, "\(karp\)", /^muu piir.j./, /^muu piir.j/, /\skarbis\s/, /\spet\s/, /\skohver\s/,
            /\smini\s/,

            /^maits.viin/, /^rumm/, /^rum/, /^cognac/, /^whisky/, /^whiskey/, /^gin/,
            /^liköör/, /^brandy/, /^viina/, /^viin/, /^vodka/, /^liviko/, /^tequila/, /^tekiila/
        ];
    }


    shallowScrape() {
        console.info(`Starting shallow scrape for ${this.storeName}`);
    }

    deepScrape() {
        console.info(`Starting deep scrape for ${this.storeName}`);
    }

    getVol(name) {
        if (!name) {
            return name
        }
        const volResult = this.volRegex.exec(name);

        if (volResult) {
            const parsed = parseFloat(volResult[2].replace(",", '.'));
            if (isNaN(parsed)) {
                console.warn(`Could not parse vol float from ${name}`);
                return null
            } else {
                return parsed
            }
        } else {
            console.warn(`Could not parse vol float from ${name}`);
            return null;
        }
    }

    getMl(name) {
        if (!name) {
            return null
        }

        const mlResult = this.mlRegex.exec(name);

        if (mlResult) {
            const parsed = parseInt(mlResult[2]);
            if (isNaN(parsed)) {
                console.warn(`Could not parse ml integer from ${name}`);
                return null
            } else {
                return parsed
            }
        }

        const clResult = this.clRegex.exec(name);

        if (clResult) {
            const parsed = parseFloat(clResult[2].replace(",", "."));
            if (isNaN(parsed)) {
                console.warn(`Could not parse cl integer from ${name}`);
                return null
            } else {
                return parsed * 10
            }
        }

        const lResult = this.lRegex.exec(name);

        if (lResult) {
            const parsed = parseFloat(lResult[2].replace(",", "."));
            if (isNaN(parsed)) {
                console.error(`Could not parse liter float from ${name}`);
                return null
            } else {
                return parsed * 1000
            }
        } else {
            console.warn(`Could not parse volume from ${name}`);
            return null;
        }
    }

    getPrice(priceString) {
        if (!priceString) {
            return null;
        }

        const priceResult = this.priceRegex.exec(priceString);
        if (priceResult) {
            const parsed = parseFloat(priceResult[1].replace(",", "."));
            if (isNaN(parsed)) {
                console.warn(`Could not parse price float from ${priceString}`)
            } else {
                return parsed
            }
        } else {
            console.warn(`Could not parse price from ${priceString}`);
            return null;
        }
    }

    removeEstonianLetters(string) {
        string = string.replace(/ä/g, "a");
        string = string.replace(/ö/g, "o");
        string = string.replace(/õ/g, "o");
        string = string.replace(/ü/g, "u");
        return string;
    }

    getCleanName(name) {
        const regexRemove = [this.volRegex, this.mlRegex, this.clRegex, this.lRegex, this.priceRegex];

        name = name.toLowerCase().trim();

        for (let i = 0; i < this.illegalWords.length; i++) {
            name = name.replace(new RegExp(this.illegalWords[i], "g"), "").trim();
        }

        for (let i = 0; i < regexRemove.length; i++) {
            const result = regexRemove[i].exec(name);

            if (result && result[1]) {
                name = name.replace(new RegExp(result[1], 'g'), "").trim();
            }
        }

        name = name.replace(/,/g, "");
        name = name.replace(/'/g, "");
        name = name.replace(/\*/g, "");

        name = name.replace(/\s\s+/g, ' ');

        name = this.removeEstonianLetters(name);

        return name;
    }
}

module.exports = Scraper;
