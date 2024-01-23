import https from 'https';
import cheerio from 'cheerio';
import entities from 'entities';

// Function to make an HTTP GET request
const get = (url) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => resolve(data));
    }).on('error', (error) => reject(error));
});

// Function to truncate a string to a specified length with an ellipsis
const truncateString = (str, maxLength) => {
    if (str.length > maxLength) {
        return str.substring(0, maxLength - 3) + '...';
    }
    return str;
};

const key = '-';
const accessToken = 'Bearer ' + key;
const mastodonUrl = 'https://-.fyi/api/v1/statuses';
const targetUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR';

// Function to pad and replace symbols in a string
const padAndReplace = (symbol, padLength, replaceSymbol) => {
    const paddedSymbol = symbol.padEnd(padLength);
    return `${paddedSymbol.replace(/\s/g, replaceSymbol)}`;
};

// Function to post details to Mastodon
const postDetails = async (text) => {
    const url = mastodonUrl;
    const authHeader = { Authorization: accessToken };
    const postData = new URLSearchParams({
        status: text,
    }).toString();

    const options = {
        method: 'POST',
        headers: {
            ...authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    try {
        const response = await new Promise((resolve, reject) => {
            const req = https.request(url, options, (response) => {
                let data = '';
                response.on('data', (chunk) => (data += chunk));
                response.on('end', () => resolve(data));
            });

            req.on('error', (error) => reject(error));
            req.write(postData);
            req.end();
        });

        console.log('Response from POST call:', response);
        return response;
    } catch (error) {
        console.error('Error in POST call:', error.message);
        throw error;
    }
};


const parseRSS = (xml) => {
    const $ = cheerio.load(xml, { xmlMode: true });
    const items = [];

    $('item').slice(0, 5).each((index, element) => {
        const $item = $(element);
        const title = entities.decodeHTML($item.find('title').text()); // Use 'entities' to decode HTML entities
        const url = $item.find('ht\\:news_item_url').first().text(); // Use '\\:' to escape the colon
        const description = truncateString(entities.decodeHTML($item.find('ht\\:news_item_snippet').first().text()), 35); // Use 'entities' to decode HTML entities
        items.push({ title, description, url });
    });

    return items;
};
const formatDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
};



export const main = async () => {
    try {
        const xml = await get(targetUrl);
        const articles = parseRSS(xml);

        const formattedDate = formatDate();
        const resultText = `Daily trend in Korea - ${formattedDate}\n\n` +
            articles.map((article, index) => {
                const formattedTitle = padAndReplace(article.title, 1, '.');
                return `${index + 1}.${formattedTitle} : ${article.description}\n\tLink: ${article.url}`;
            }).join('\n\n') +
            '\nSource: https://trends.google.com';

        // Call the postDetails function with the formatted details
        await postDetails(resultText);
    } catch (error) {
        console.error('Error:', error.message);
    }
};