const API_KEY = 'AIzaSyA5_xd78skq-lOO4hRu-EL9ItydWSHAi1E';
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

const HOURS_BEFORE = 24;

// 現在の時刻と24時間前の時刻を計算
const now = new Date();
const past24Hours = new Date(now.getTime() - (HOURS_BEFORE * 60 * 60 * 1000)).toISOString();

// チャンネルからの動画を取得
async function fetchChannelVideos(channelId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&publishedAfter=${past24Hours}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Channel Videos Data:', data); // デバッグ用
        return data.items;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
}

// 動画の詳細情報を取得
async function fetchVideoDetails(videoId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveBroadcastDetails,snippet&id=${videoId}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Video Details Data:', data); // デバッグ用
        return data.items[0];
    } catch (error) {
        console.error('Error fetching video details:', error);
        return {};
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
async function displayEvents(events) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = ''; // 既存のコンテンツをクリア

    for (const event of events) {
        const videoId = event.url.split('v=')[1]; // URLから動画IDを抽出
        try {
            const videoDetails = await fetchVideoDetails(videoId); // 動画の詳細情報を取得
            const startTime = videoDetails.liveBroadcastDetails ? videoDetails.liveBroadcastDetails.scheduledStartTime : event.date; // 配信開始時刻
            const thumbnailUrl = getThumbnailUrl(videoId);

            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `
                <a href="${event.url}" target="_blank">
                    <img src="${thumbnailUrl}" alt="${event.title}" style="width: 320px; height: auto;">
                    <h2>${event.title}</h2>
                    <p>${new Date(startTime).toLocaleString()}</p>
                </a>
            `;
            scheduleDiv.appendChild(eventDiv);
        } catch (error) {
            console.error('Error displaying event:', error);
        }
    }
}

// メインの処理
async function main() {
    const events = [];
    for (let channelId of CHANNEL_IDS) {
        const videos = await fetchChannelVideos(channelId);
        if (videos) {
            for (const video of videos) {
                const videoId = video.id.videoId;
                events.push({
                    title: video.snippet.title,
                    date: video.snippet.publishedAt, // 初期値として
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            }
        }
    }

    // 配信開始時刻を取得してイベントを更新
    for (const event of events) {
        const videoId = event.url.split('v=')[1];
        try {
            const videoDetails = await fetchVideoDetails(videoId);
            event.date = videoDetails.liveBroadcastDetails ? videoDetails.liveBroadcastDetails.scheduledStartTime : event.date; // 配信開始時刻
        } catch (error) {
            console.error('Error updating event date:', error);
        }
    }

    const sortedEvents = sortEventsByDate(events);
    displayEvents(sortedEvents);
}

// ページが読み込まれたときに実行
window.onload = main;
