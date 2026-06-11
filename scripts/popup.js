document.addEventListener('DOMContentLoaded', () => {
  const JSON_URL = '/data/latest-video.json';
  
  // Cache busting parameter to ensure we don't get a stale JSON from browser cache
  fetch(`${JSON_URL}?t=${new Date().getTime()}`, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      if (!data || !data.id) return; // Empty or invalid data

      const lastSeenVideo = localStorage.getItem('lastSeenVideo');
      
      // Calculate age of the video in days
      const pubDate = new Date(data.published);
      const isDateValid = !isNaN(pubDate.getTime());
      const ageInMs = new Date().getTime() - pubDate.getTime();
      const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
      
      // Show popup if the user hasn't seen/dismissed this video yet AND it is less than 3 days old
      if (data.id !== lastSeenVideo && isDateValid && ageInDays <= 3) {
        showPopup(data);
      }
    })
    .catch(err => console.error('Failed to load latest video info:', err));
});

function showPopup(videoData) {
  // Format the date nicely
  const pubDate = new Date(videoData.published);
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = isNaN(pubDate) ? videoData.published : pubDate.toLocaleDateString(undefined, dateOptions);

  // Create DOM elements
  const overlay = document.createElement('div');
  overlay.className = 'yt-popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  
  overlay.innerHTML = `
    <div class="yt-popup-card">
      <button class="yt-popup-close" aria-label="Close notification">&times;</button>
      <div class="yt-popup-thumbnail-container">
        <img src="${videoData.thumbnail}" alt="Thumbnail" class="yt-popup-thumbnail" loading="lazy">
        <span class="yt-popup-badge">🎬 New Video</span>
      </div>
      <div class="yt-popup-content">
        <h3 class="yt-popup-title">${videoData.title}</h3>
        <div class="yt-popup-date">Published on ${formattedDate}</div>
        <a href="${videoData.url}" target="_blank" rel="noopener noreferrer" class="yt-popup-cta">Watch Now</a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation
  // A small timeout ensures the element is in the DOM before we add the active class
  setTimeout(() => {
    overlay.classList.add('yt-popup-active');
  }, 10);

  // Handlers
  const closeBtn = overlay.querySelector('.yt-popup-close');
  const ctaBtn = overlay.querySelector('.yt-popup-cta');

  const dismissPopup = () => {
    localStorage.setItem('lastSeenVideo', videoData.id);
    overlay.classList.remove('yt-popup-active');
    setTimeout(() => {
      overlay.remove();
    }, 300); // Wait for transition to finish
  };

  closeBtn.addEventListener('click', dismissPopup);
  
  ctaBtn.addEventListener('click', () => {
    localStorage.setItem('lastSeenVideo', videoData.id);
    // Let the link open normally in a new tab, then dismiss the popup
    dismissPopup();
  });

  // Optional: close on click outside the card
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      dismissPopup();
    }
  });
}
