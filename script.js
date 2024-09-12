const API_KEY = 'AIzaSyA5_xd78skq-lOO4hRu-EL9ItydWSHAi1E';  // あなたのAPIキー
const CHANNEL_IDS = [
    'UCIOUnOw74BcQZzskbjK3f8w',
    'UCAflRAT6B_7nvxAK72ztN3A',
    'UCQjIXLk6lridUCQIBHaLMDw',
    'UCUuXWtrg4-1kGa3f7WEWzuA',
    'UCNwjdfFJVqQ9-qi1lwn4olw',
    'UCBxgYX7hJy6TZVvLXOEQrWw',
    'UCvCks1oVZfBuG1VXicOr5aw',
    'UCBT07kDimH3-HJ9zq1rFQKg',
    'UCfvCFbU56UWX9ML0sOr9_iQ',
    'UCY85ViSyTU5Wy_bwsUVjkdA',
    'UCRsgVmJAknvkTjoz2miNG5w',
    'UCBvGU2rqWy2jiIeDBScdw1g',
    'UCV5jFxqHWDppyzznOBJbvVg'
];

async function fetchChannelVideos(channelId) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${API_KEY}`);
    const data = await response.json();
    return data.items;
}

async function displayUpcomingVideos() {
    const scheduleDiv = document.getElementById('schedule');
    
    for (let channelId of CHANNEL_IDS) {
        const videos = await fetchChannelVideos(channelId);
        if (videos.length > 0) {
            videos.forEach(video => {
                const videoElement = document.createElement('div');
                videoElement.innerHTML = `
                    <h3>${video.snippet.title}</h3>
                    <p>配信予定日時: ${new Date(video.snippet.publishedAt).toLocaleString()}</p>
                    <p>チャンネル: ${video.snippet.channelTitle}</p>
                    <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">視聴ページへ</a>
                    <hr>
                `;
                scheduleDiv.appendChild(videoElement);
            });
        }
    }
}

displayUpcomingVideos();
