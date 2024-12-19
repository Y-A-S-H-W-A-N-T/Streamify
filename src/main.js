import JSZip from "jszip";
import { saveAs } from "file-saver";

const songList = document.getElementById("song-list");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const exportButton = document.getElementById("export");
const paginationContainer = document.getElementById("pagination");

let songs = []; // Placeholder for song data
let currentPage = 1;
const itemsPerPage = 10; // Number of songs per page

// Fetch songs from the JSON file
async function loadSongs() {
  try {
    const response = await fetch("/spotify_songs.json");
    songs = await response.json();
    renderSongs(filterSongs());
    renderPagination(filterSongs());
  } catch (error) {
    console.error("Failed to load songs:", error);
  }
}

// Render songs to the DOM
function renderSongs(filteredSongs) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSongs = filteredSongs.slice(startIndex, endIndex);

  songList.innerHTML = paginatedSongs
    .map(
      (song) => `
    <div class="song-card">
      <h3>${song.track_name}</h3>
      <p><strong>Artist:</strong> ${song.track_artist}</p>
      <p><strong>Popularity:</strong> ${song.track_popularity}</p>
      <p><strong>Album:</strong> ${song.track_album_name}</p>
      <p><strong>Genre:</strong> ${song.playlist_genre}</p>
    </div>`
    )
    .join("");
}

// Render pagination controls
function renderPagination(filteredSongs) {
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = `page-btn ${i === currentPage ? "active" : ""}`;
    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderSongs(filteredSongs);
      renderPagination(filteredSongs);
    });
    paginationContainer.appendChild(pageButton);
  }
}

// Filter songs based on input
function filterSongs() {
  const searchTerm = searchInput.value.toLowerCase();
  const genre = genreFilter.value;
  return songs.filter(
    (song) =>
      (!genre || song.playlist_genre === genre) &&
      Object.values(song).some((value) =>
        value.toString().toLowerCase().includes(searchTerm)
      )
  );
}

// Event listeners for filtering
searchInput.addEventListener("input", () => {
  const filtered = filterSongs();
  currentPage = 1; // Reset to the first page
  renderSongs(filtered);
  renderPagination(filtered);
});
genreFilter.addEventListener("change", () => {
  const filtered = filterSongs();
  currentPage = 1; // Reset to the first page
  renderSongs(filtered);
  renderPagination(filtered);
});

// Export filtered data as a zip file
exportButton.addEventListener("click", () => {
  const filteredSongs = filterSongs();
  const zip = new JSZip();
  zip.file(
    "filtered_songs.json",
    JSON.stringify(filteredSongs, null, 2)
  );
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "filtered_songs.zip");
  });
});

// Load the songs on page load
loadSongs();