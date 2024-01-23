//node.js 18
//1. digitalocean API Key
//2. destination api for POST call 
import https from 'https';

const playlistUrl = "https://www.youtube.com/playlist?list=PLVbP054jv0KrJ8wLB8pxmuMLqRi5e7zWe";
const accessToken = 'Bearer <ACCESS TOKEN>';

// Function to make an HTTP GET request
const get = (url) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => resolve(data));
  }).on('error', (error) => reject(error));
});

// Function to post the video details to the API
const postVideoDetails = async (videoDetails) => {
  const url = 'https:// TARGET_URL!!!!! /api/v1/statuses';
  const authHeader = { Authorization: accessToken };
  const postData = new URLSearchParams({
    status: `Latest Crypto News: ${videoDetails}`,
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

// Function to process the playlist URL
export const main = async () => {
  try {
    const html = await get(playlistUrl);
    const videoLinks = html.match(/\/watch\?v=[^\\u0026]+/g);
    await postVideoDetails(`https://www.youtube.com${videoLinks[0]}`);
    console.log('Successfully posted video details');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
