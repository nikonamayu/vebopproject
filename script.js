const API_KEY = 'AIzaSyC6v0Fgczo7cYiBUtImIClh76hXgLuZmR4';  // 新しいAPIキー
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
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
}

async function fetchVideoDetails(videoId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveBroadcastDetails,snippet&id=${videoId}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data.items[0];
    } catch (error) {
        console.error('Error fetching video details:', error);
        return {};
    }
}

function getThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function sortEventsByDate(events) {
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function displayEvents(events) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';

    for (const event of events) {
        const videoId = event.url.split('v=')[1];
        try {
            const videoDetails = await fetchVideoDetails(videoId);
            const startTime = videoDetails.liveBroadcastDetails ? videoDetails.liveBroadcastDetails.scheduledStartTime : event.date;
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

async function main() {
    const events = [];
    for (let channelId of CHANNEL_IDS) {
        const videos = await fetchChannelVideos(channelId);
        if (videos) {
            for (const video of videos) {
                const videoId = video.id.videoId;
                events.push({
                    title: video.snippet.title,
                    date: video.snippet.publishedAt,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            }
        }
    }

    for (const event of events) {
        const videoId = event.url.split('v=')[1];
        try {
            const videoDetails = await fetchVideoDetails(videoId);
            event.date = videoDetails.liveBroadcastDetails ? videoDetails.liveBroadcastDetails.scheduledStartTime : event.date;
        } catch (error) {
            console.error('Error updating event date:', error);
        }
    }

    const sortedEvents = sortEventsByDate(events);
    displayEvents(sortedEvents);
}

window.onload = main;
