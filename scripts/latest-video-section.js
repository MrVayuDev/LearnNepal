document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('latest-video-section');
  if (!container) return; // Only run if the container exists on the current page

  const JSON_URL = '/data/latest-video.json';
  
  fetch(`${JSON_URL}?t=${new Date().getTime()}`, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      if (!data || !data.id) {
        container.style.display = 'none'; // Hide section if no data
        return;
      }

      // Format date
      const pubDate = new Date(data.published);
      const formattedDate = isNaN(pubDate) ? data.published : pubDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

      // Populate container
      container.innerHTML = `
        <div class="latest-video-wrapper" style="display: flex; gap: 20px; align-items: center; max-width: 800px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div class="video-thumb" style="flex: 1; max-width: 50%;">
            <a href="${data.url}" target="_blank" rel="noopener noreferrer" style="display: block;">
              <img src="${data.thumbnail}" alt="Thumbnail" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;">
            </a>
          </div>
          <div class="video-info" style="flex: 1; padding: 20px;">
            <span style="background: #ff0000; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Latest Video</span>
            <h3 style="margin: 10px 0; font-size: 20px; line-height: 1.3;">
              <a href="${data.url}" target="_blank" rel="noopener noreferrer" style="color: #333; text-decoration: none;">${data.title}</a>
            </h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Published on ${formattedDate}</p>
            <a href="${data.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #333; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500;">Watch on YouTube</a>
          </div>
        </div>
      `;
    })
    .catch(err => {
      console.error('Failed to load latest video section:', err);
      container.style.display = 'none';
    });
});
