import https from 'https';
import cheerio from 'cheerio';

const targetUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR';

const get = (url) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => resolve(data));
    }).on('error', (error) => reject(error));
});

const parseRSS = (xml) => {
    const $ = cheerio.load(xml, { xmlMode: true });
    const items = [];

    $('item').slice(0, 5).each((index, element) => {
        const $item = $(element);
        const title = $item.find('title').text();
        const description = $item.find('description').text();
        const url = $item.find('link').text(); // Use 'link' instead of 'url'
        items.push({ title, description, url });
    });

    return items;
};

export const main = async () => {
    try {
        const xml = await get(targetUrl);
        const articles = parseRSS(xml);

        articles.forEach((article, index) => {
            console.log(`Trend ${index + 1}: ${article.title}`);
            console.log(`Description: ${article.description}`);
            console.log(`Link: ${article.url}\n`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
};
