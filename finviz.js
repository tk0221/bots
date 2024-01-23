import https from 'https';
import cheerio from 'cheerio';
const accessToken = 'Bearer <access>';

const targetUrl = 'https://finviz.com/';

// Function to make an HTTP GET request
const get = (url) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => resolve(data));
  }).on('error', (error) => reject(error));
});
const padAndReplace = (symbol, padLength, replaceSymbol) => {
  const paddedSymbol = symbol.padEnd(padLength);
  return `${paddedSymbol.replace(/\s/g, replaceSymbol)}`;
};

// Function to extract information from the HTML
const scrapeData = (html) => {
  const $ = cheerio.load(html);
  const extractedData = [];

  // Iterate over each row in the table
  $('tr.styled-row.is-bordered.is-rounded').each((index, element) => {
    const $row = $(element);
    const stockSymbol = $row.find('.hp_label-container a.tab-link').text().trim();
    const stockChange = $row.find('.hp_label-container span').text().trim();
// Helper function to pad stock symbols with spaces and replace them with a symbol

    if (stockSymbol !== '') {
        extractedData.push(`${padAndReplace(stockSymbol, 6, ' ')}\t\t: ${stockChange}`);
    }
  });

  return extractedData;
};

const postDetails = async (text) => {
  const url = 'https://#################fyi/api/v1/statuses';
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


export const main = async () => {
  try {
    const html = await get(targetUrl);
    const extractedData = scrapeData(html);

    // Concatenate the stock symbols and changes into a single text string with new lines
    let resultText = 'Major Mover\n'
    resultText += extractedData.join('\n');

    await postDetails(resultText);
    // Print the result
    console.log(resultText);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
