const API_KEY = 'AIzaSyBfrwUzoX8NJVN6AotMJggJh5cJLCqjmAc';  // 新しいAPIキー

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
}

async function displayUpcomingVideos() {
    const scheduleDiv = document.getElementById('schedule');
    const now = new Date();

    for (let channelId of CHANNEL_IDS) {
        const videos = await fetchChannelVideos(channelId);
        if (videos.length > 0) {
            videos.forEach(video => {
                const videoDate = new Date(video.snippet.publishedAt);
                // Check if the video is scheduled for the future or within the past 24 hours
                if (videoDate > now || videoDate > now - (24 * 60 * 60 * 1000)) {
                    const videoElement = document.createElement('div');
                    videoElement.innerHTML = `
                        <h3>${video.snippet.title}</h3>
                        <p>配信予定日時: ${videoDate.toLocaleString()}</p>
                        <p>チャンネル: ${video.snippet.channelTitle}</p>
                        <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">視聴ページへ</a>
                        <hr>
                    `;
                    scheduleDiv.appendChild(videoElement);
                }
            });
        }
    }
}

// YouTubeサムネイルURLを生成する関数
function getThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// 配信予定を時間で並び替え
function sortEventsByDate(events) {
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 配信予定をHTMLに追加
function displayEvents(events) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = ''; // 既存のコンテンツをクリア

    events.forEach(event => {
        const videoId = event.url.split('v=')[1]; // URLから動画IDを抽出
        const thumbnailUrl = getThumbnailUrl(videoId);

        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerHTML = `
            <a href="${event.url}" target="_blank">
                <img src="${thumbnailUrl}" alt="${event.title}" style="width: 320px; height: auto;">
                <h2>${event.title}</h2>
                <p>${new Date(event.date).toLocaleString()}</p>
            </a>
        `;
        scheduleDiv.appendChild(eventDiv);
    });
}

// メインの処理
async function main() {
    const events = await fetchEventData();
    const sortedEvents = sortEventsByDate(events);
    displayEvents(sortedEvents);
}

// ページが読み込まれたときに実行
window.onload = displayUpcomingVideos;
