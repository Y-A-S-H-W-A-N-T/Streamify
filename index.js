// index.js
import { artistFilter } from './filters/artistFilter.js';
import { songFilter } from './filters/songFilter.js';
import { genreFilter } from './filters/genreFilter.js';
import { popularityFilter } from './filters/popularityFilter.js';
import { formatDuration } from './utils/formatDuration.js';
import { debounce } from './utils/debounce.js';
import JSZip from "jszip";
import { saveAs } from 'file-saver';


document.addEventListener("DOMContentLoaded", () => {
    const songList = document.getElementById("song-list");
    const artistSearchInput = document.getElementById("artist-search");
    const songSearchInput = document.getElementById("song-search");
    const genreFilterSelect = document.getElementById("genre-filter");
    const popularityFilterSelect = document.getElementById("popularity-filter");
    const exportButton = document.getElementById("export");
    const paginationContainer = document.getElementById("pagination");

    let songs = [];
    let currentPage = 1;
    const itemsPerPage = 20;

    // for loading and displaying songs from the imported json file
    async function loadSongs() {
      try {
        const response = await fetch("/spotify_songs.json");
        songs = await response.json();
        const filtered = filterSongs();
        renderSongs(filtered);
        renderPagination(filtered);
      } catch (error) {
        console.error("Failed to load songs:", error);
        songList.innerHTML = '<p style="color: red;">Error loading songs. Please try again later.</p>';
      }
    }

    // songs sections

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

    // pagination for the site
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

    // filter functionality, returns filtered data after applying the filters
    function filterSongs() {
      const artistTerm = artistSearchInput.value;
      const songTerm = songSearchInput.value;
      const genre = genreFilterSelect.value;
      const popularity = popularityFilterSelect.value;

      let filtered = songs;
      filtered = artistFilter(filtered, artistTerm);
      filtered = songFilter(filtered, songTerm);
      filtered = genreFilter(filtered, genre);
      filtered = popularityFilter(filtered, popularity);

      return filtered;
    }

    const handleSearch = debounce(() => {
      currentPage = 1;
      const filtered = filterSongs();
      renderSongs(filtered);
      renderPagination(filtered);
    }, 300);

    artistSearchInput.addEventListener("input", handleSearch);
    songSearchInput.addEventListener("input", handleSearch);
    genreFilterSelect.addEventListener("change", handleSearch);
    popularityFilterSelect.addEventListener("change", handleSearch);

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