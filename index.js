// index.js
document.addEventListener("DOMContentLoaded", () => {
    const songList = document.getElementById("song-list");
    const artistSearchInput = document.getElementById("artist-search");
    const songSearchInput = document.getElementById("song-search");
    const genreFilter = document.getElementById("genre-filter");
    const popularityFilter = document.getElementById("popularity-filter");
    const exportButton = document.getElementById("export");
    const paginationContainer = document.getElementById("pagination");
  
    let songs = [];
    let currentPage = 1;
    const itemsPerPage = 20;
  
    function formatDuration(durationMs) {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  
    async function loadSongs() {
      try {
        const response = await fetch("spotify_songs.json");
        songs = await response.json();
        // Log the first song to see its structure
        console.log("First song structure:", songs[0]);
        const filtered = filterSongs();
        renderSongs(filtered);
        renderPagination(filtered);
      } catch (error) {
        console.error("Failed to load songs:", error);
        songList.innerHTML = '<p style="color: red;">Error loading songs. Please try again later.</p>';
      }
    }
  
    function renderSongs(filteredSongs) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedSongs = filteredSongs.slice(startIndex, endIndex);
  
      if (paginatedSongs.length === 0) {
        songList.innerHTML = '<p>No songs found matching your criteria.</p>';
        return;
      }
  
      songList.innerHTML = paginatedSongs
        .map((song) => {
          const popularityCategory =
            song.track_popularity <= 25
              ? { label: "Low", color: "red" }
              : song.track_popularity <= 50
              ? { label: "Average", color: "orange" }
              : song.track_popularity <= 75
              ? { label: "Medium", color: "yellowgreen" }
              : { label: "High", color: "green" };
  
          return `
            <div class="song-card">
                <h3>${song.track_name || 'Untitled'}</h3>
                <p>by <strong>${song.track_artist || 'Unknown Artist'}</strong></p>
                <p><strong>Album:</strong> ${song.track_album_name || 'Unknown Album'}</p>
                <p><strong>Popularity:</strong> 
                <span style="color: ${popularityCategory.color}; font-weight: bold;">
                    ${popularityCategory.label}
                </span>
                </p>
                <p class="genre"><strong>Genre:</strong> ${song.playlist_genre || 'Unknown Genre'}</p>

                <div class="bottom-buttons">
                    <p><strong><i class="fa-solid fa-regular fa-clock fa-beat" style="color: #1db954;"></i></strong> ${formatDuration(song.duration_ms || 0)}</p>
                    ${song.track_id ? `
                    <a href="https://open.spotify.com/track/${song.track_id}" target="_blank" class="listen-link">
                        Play <strong><i class="fa-solid fa-regular fa-play" style="color: #1db954;"></i></strong>
                    </a>
                    ` : ''}
                </div>
            </div>
            `;
        })
        .join("");
    }
  
    function renderPagination(filteredSongs) {
      const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
      if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
      }
  
      paginationContainer.innerHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="current-page-label">Page ${currentPage} of ${totalPages}</span>
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
  
      const [prevButton, , nextButton] = paginationContainer.children;
  
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          const filtered = filterSongs();
          renderSongs(filtered);
          renderPagination(filtered);
        }
      });
  
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          const filtered = filterSongs();
          renderSongs(filtered);
          renderPagination(filtered);
        }
      });
    }
  
    function filterSongs() {
      const artistTerm = artistSearchInput.value.toLowerCase().trim();
      const songTerm = songSearchInput.value.toLowerCase().trim();
      const genre = genreFilter.value;
      const popularity = popularityFilter.value;
  
      return songs.filter((song) => {
        // Safely access and convert string properties
        const songName = String(song.track_name || '').toLowerCase();
        const artistName = String(song.track_artist || '').toLowerCase();
        const genreName = String(song.playlist_genre || '');
        
        const popularityCategory =
          (song.track_popularity || 0) <= 25
            ? "low"
            : (song.track_popularity || 0) <= 50
            ? "average"
            : (song.track_popularity || 0) <= 75
            ? "medium"
            : "high";
  
        const artistMatch = !artistTerm || artistName.includes(artistTerm);
        const songMatch = !songTerm || songName.includes(songTerm);
        const genreMatch = !genre || genreName === genre;
        const popularityMatch = !popularity || popularityCategory === popularity;
  
        return artistMatch && songMatch && genreMatch && popularityMatch;
      });
    }
  
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    const handleSearch = debounce(() => {
      currentPage = 1;
      const filtered = filterSongs();
      renderSongs(filtered);
      renderPagination(filtered);
    }, 300);
  
    artistSearchInput.addEventListener("input", handleSearch);
    songSearchInput.addEventListener("input", handleSearch);
    genreFilter.addEventListener("change", handleSearch);
    popularityFilter.addEventListener("change", handleSearch);
  
    exportButton.addEventListener("click", () => {
      const filteredSongs = filterSongs();
      const zip = new JSZip();
      zip.file("filtered_songs.json", JSON.stringify(filteredSongs, null, 2));
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "filtered_songs.zip");
      });
    });

    
  
    loadSongs();
  });