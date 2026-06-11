const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const CHANNEL_ID = 'UC5lGlVNDwjPWYNvaBVhN6cg';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const JSON_PATH = path.join(__dirname, '../../data/latest-video.json');

async function fetchLatestVideo() {
  try {
    console.log(`Fetching RSS feed from: ${RSS_URL}`);
    const response = await fetch(RSS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlData = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(xmlData);
    
    // Check if feed contains entries
    if (!result.feed || !result.feed.entry) {
      console.log('No video entries found in the feed.');
      process.exit(0);
    }
    
    // Handle both single entry and array of entries
    const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    const latestEntry = entries[0];
    
    const videoId = latestEntry['yt:videoId'];
    const title = latestEntry.title;
    const published = latestEntry.published;
    
    const newVideoData = {
      id: videoId,
      title: title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      published: published,
      url: `https://youtu.be/${videoId}`
    };
    
    // Read existing data
    let existingData = {};
    if (fs.existsSync(JSON_PATH)) {
      const rawData = fs.readFileSync(JSON_PATH, 'utf8');
      try {
        existingData = JSON.parse(rawData);
      } catch (e) {
        console.warn('Could not parse existing JSON, it might be empty or invalid.');
      }
    } else {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
    }
    
    // Compare
    if (existingData.id !== newVideoData.id) {
      console.log(`New video detected! ID: ${newVideoData.id} - ${newVideoData.title}`);
      fs.writeFileSync(JSON_PATH, JSON.stringify(newVideoData, null, 2));
      console.log('Updated latest-video.json successfully.');
    } else {
      console.log('No new video found. latest-video.json is up to date.');
    }
    
  } catch (error) {
    console.error('Error fetching or processing YouTube RSS feed:', error.message);
    process.exit(1); // Exit with error so Action catches it
  }
}

fetchLatestVideo();
