const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const API_KEY = process.env.API_KEY; // 環境変数からAPIキーを取得
  const CHANNEL_IDS = [
'UCAflRAT6B_7nvxAK72ztN3A',
'UCUuXWtrg4-1kGa3f7WEWzuA',
'UCIOUnOw74BcQZzskbjK3f8w',
'UCQjIXLk6lridUCQIBHaLMDw',
'UCNwjdfFJVqQ9-qi1lwn4olw',
'UCvCks1oVZfBuG1VXicOr5aw',
'UCBxgYX7hJy6TZVvLXOEQrWw',
'UCY85ViSyTU5Wy_bwsUVjkdA',
'UC_wo1VD3xVl4Y_J15Wxm2ig',
'UCBT07kDimH3-HJ9zq1rFQKg',
'UCfvCFbU56UWX9ML0sOr9_iQ',
'UCV1is8yPGubl7J7vG7K45Hg',
'UCBvGU2rqWy2jiIeDBScdw1g',
'UCRsgVmJAknvkTjoz2miNG5w',
'UCV5jFxqHWDppyzznOBJbvVg',
];

  const fetchChannelVideos = async (channelId) => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 過去24時間
      const nowISOString = now.toISOString();
      const oneDayAgoISOString = oneDayAgo.toISOString();

      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&publishedAfter=${oneDayAgoISOString}&key=${API_KEY}`);
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorDetails}`);
      }
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      return [];
    }
  };

  try {
    const results = await Promise.all(CHANNEL_IDS.map(id => fetchChannelVideos(id)));
    const videos = results.flat();
    return {
      statusCode: 200,
      body: JSON.stringify({ schedule: videos }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch schedule' }),
    };
  }
};
