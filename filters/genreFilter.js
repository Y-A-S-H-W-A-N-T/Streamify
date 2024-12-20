// filters/genreFilter.js
export function genreFilter(songs, genre) {
    return songs.filter((song) => {
      const genreName = String(song.playlist_genre || '').toLowerCase();
      return !genre || genreName === genre.toLowerCase().trim();
    });
  }  