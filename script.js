document.addEventListener('DOMContentLoaded', function() {
  fetch('/.netlify/functions/fetchData')
    .then(response => response.json())
    .then(data => {
      const scheduleElement = document.getElementById('schedule');
      const now = new Date();

      // 配信予定を時間順に並べ替える
      data.schedule.sort((a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt));

      data.schedule.forEach(video => {
        const videoDate = new Date(video.snippet.publishedAt);
        if (videoDate > now || videoDate > now - (24 * 60 * 60 * 1000)) {
          const videoElement = document.createElement('div');
          videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}" style="width: 120px; height: 90px;">
            <h3>${video.snippet.title}</h3>
            <p>配信予定日時: ${videoDate.toLocaleString()}</p>
            <p>チャンネル: ${video.snippet.channelTitle}</p>
            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">視聴ページへ</a>
            <hr>
          `;
          scheduleElement.appendChild(videoElement);
        }
      });
    })
    .catch(error => console.error('Error fetching schedule:', error));
});
